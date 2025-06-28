import { HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import axios from 'axios';
import { environment } from '../../environments/environment.prod';

// Add missing type definitions or import them if they exist elsewhere
export interface UserProfile {
  user_profile_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  preferred_language?: string;
  preferred_currency?: string;
  airline_ffn_data?: any;
  hotel_loyalty_data?: any;
  meal_preference?: string;
  room_preference?: string;
  preferred_travel_class?: string;
  profile_status?: string;
  created_at?: string;
  updated_at?: string;
  membershipTier?: {
    membership_tier_id: string;
    tier_name: string;
    tier_level: number;
  };
}

export interface RecentSearchForDisplay {
  search_query: string;
  search_type: string;
  module?: string;
}

export class UserProfileService {
  private userProfile$ = new BehaviorSubject<UserProfile | null>(null);
  private readonly USER_PROFILE_CACHE_KEY = 'hypermiles_user_profile';
  private readonly RECENT_SEARCHES_CACHE_KEY = 'hypermiles_recent_searches';
  private readonly RECENT_SEARCHES_CACHE_DURATION = 300000;

  constructor() {
    this.loadCachedProfile();
  }

  get currentUserProfile(): Observable<UserProfile | null> {
    return this.userProfile$.asObservable();
  }

  get currentUserProfileId(): string | null {
    return this.userProfile$.value?.user_profile_id || null;
  }

  private loadCachedProfile(): void {
    try {
      const cached = localStorage.getItem(this.USER_PROFILE_CACHE_KEY);
      if (cached) {
        const profile: UserProfile = JSON.parse(cached);
        this.userProfile$.next(profile);
      }
    } catch {
      localStorage.removeItem(this.USER_PROFILE_CACHE_KEY);
    }
  }

  async fetchUserProfileByUserId(googleUserId: string): Promise<UserProfile | null> {
    const query = `
      query GetUserProfileByUserId($userId: String!) {
        getUserProfileByUserId(userId: $userId) {
          user_profile_id user_id first_name last_name email phone_number date_of_birth
          gender nationality preferred_language preferred_currency airline_ffn_data
          hotel_loyalty_data meal_preference room_preference preferred_travel_class
          profile_status created_at updated_at membershipTier {
            membership_tier_id tier_name tier_level
          }
        }
      }
    `;

    try {
      const response = await axios.post(environment.graphqlEndpoint, {
        query,
        variables: { userId: googleUserId },
      }, { headers: this.getAxiosHeaders('GetUserProfileByUserId') });

      const profile = response.data?.data?.getUserProfileByUserId || null;
      if (profile) {
        this.cacheProfile(profile);
        this.userProfile$.next(profile);
      }
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  getRecentSearchesForDisplay(searchType: string): Observable<RecentSearchForDisplay[]> {
    const userProfileId = this.currentUserProfileId;
    if (!userProfileId) return of([]);

    const cached = this.getCachedRecentSearches();
    if (cached) return of(cached.filter(s => s.search_type === searchType));

    const query = `
      query GetRecentSearchesForDisplay($userProfileId: ID!) {
        getRecentSearchesForDisplay(userProfileId: $userProfileId, limit: 5) {
          search_query search_type module
        }
      }
    `;

    return new Observable(observer => {
      axios.post(environment.graphqlEndpoint, {
        query,
        variables: { userProfileId },
      }, { headers: this.getAxiosHeaders('GetRecentSearchesForDisplay') })
        .then(response => {
const searches: RecentSearchForDisplay[] = response.data?.data?.getRecentSearchesForDisplay || [];
const filtered = searches.filter((s) => s.search_type === searchType);
          this.cacheRecentSearches(filtered);
          observer.next(filtered);
          observer.complete();
        })
        .catch(err => {
          console.error('Error getting recent searches:', err);
          observer.next([]);
          observer.complete();
        });
    });
  }

  async saveActualSearchHistory(
    displayName: string, searchType: string,
    cityId?: string, hotelId?: string
  ): Promise<boolean> {
    const userProfileId = this.currentUserProfileId;
    if (!userProfileId) return false;

    const mutation = `
      mutation SaveActualSearchHistory($userProfileId: ID!, $displayName: String!, $searchType: String!, $cityId: String, $hotelId: String) {
        saveActualSearchHistory(
          userProfileId: $userProfileId, displayName: $displayName,
          searchType: $searchType, cityId: $cityId, hotelId: $hotelId
        )
      }
    `;

    try {
      const response = await axios.post(environment.graphqlEndpoint, {
        query: mutation,
        variables: { userProfileId, displayName, searchType, cityId, hotelId },
      }, { headers: this.getAxiosHeaders('SaveActualSearchHistory') });

      const success = response.data?.data?.saveActualSearchHistory || false;
      if (success) this.clearUserRecentSearchesCache(userProfileId);
      return success;
    } catch (error) {
      console.error('Error saving search history:', error);
      return false;
    }
  }

  clearUserProfile(): void {
    const userProfileId = this.currentUserProfileId;
    this.userProfile$.next(null);
    localStorage.removeItem(this.USER_PROFILE_CACHE_KEY);
    if (userProfileId) this.clearUserRecentSearchesCache(userProfileId);
  }

  private cacheProfile(profile: UserProfile): void {
    localStorage.setItem(this.USER_PROFILE_CACHE_KEY, JSON.stringify(profile));
  }

  private cacheRecentSearches(searches: RecentSearchForDisplay[]): void {
    const userProfileId = this.currentUserProfileId;
    if (!userProfileId) return;
    const cacheKey = `${this.RECENT_SEARCHES_CACHE_KEY}_${userProfileId}`;
    const cacheData = { searches, timestamp: Date.now(), userProfileId };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  }

  private getCachedRecentSearches(): RecentSearchForDisplay[] | null {
    const userProfileId = this.currentUserProfileId;
    if (!userProfileId) return null;
    const cacheKey = `${this.RECENT_SEARCHES_CACHE_KEY}_${userProfileId}`;
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;

    const cache = JSON.parse(raw);
    const isExpired = Date.now() - cache.timestamp > this.RECENT_SEARCHES_CACHE_DURATION;
    return !isExpired && cache.userProfileId === userProfileId ? cache.searches : null;
  }

  private clearUserRecentSearchesCache(userProfileId: string): void {
    const key = `${this.RECENT_SEARCHES_CACHE_KEY}_${userProfileId}`;
    localStorage.removeItem(key);
  }

  private getHeaders(operationName: string): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-apollo-operation-name': operationName,
      'Accept': 'application/json'
    });
  }

  private getAxiosHeaders(operationName: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-apollo-operation-name': operationName,
      'Accept': 'application/json'
    };
  }
}