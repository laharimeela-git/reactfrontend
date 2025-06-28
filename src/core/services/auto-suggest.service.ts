// src/services/autoSuggestService.ts
import axios, { AxiosResponse } from 'axios';
// import { AutoSuggestInput, AutoSuggestResponse, EnrichedSuggestionData, Suggestion } from '../models/suggestion';
import { UserProfileService } from './user-profile.service';
import {  Suggestion } from '../models/suggestion.interface';
import { AutoSuggestInput, AutoSuggestResponse } from '../models/suggestion.interface';
import { environment } from '../../environments/environment.prod';

export enum SearchMode {
  RECENT_ONLY = 'recent-only',
  AUTO_SUGGEST = 'auto-suggest'
}

export class AutoSuggestService {
  private cache = new Map<string, { data: Suggestion[], timestamp: number }>();
  private enrichmentCache = new Map<string, EnrichedCacheEntry>();
  private readonly CACHE_DURATION = 5 * 60 * 1000;
  private readonly ENRICHMENT_CACHE_DURATION = 10 * 60 * 1000;
  private userProfileService: UserProfileService;

  constructor(userProfileService: UserProfileService) {
    this.userProfileService = userProfileService;
  }

  async getSearchResults(searchTerm: string, mode: SearchMode, input?: AutoSuggestInput, searchType: 'hotel' | 'flight' | 'bus' = 'hotel'): Promise<AutoSuggestResponse> {
    if (mode === SearchMode.RECENT_ONLY) {
      return this.getRecentSearchesOnly(searchType);
    } else {
      const searchInput = input || { searchTerm, limit: 10 };
      return this.searchSuggestions(
        searchInput,
        this.userProfileService.currentUserProfileId ?? undefined
      );
    }
  }

  private async getRecentSearchesOnly(searchType: string): Promise<AutoSuggestResponse> {
    try {
      const recentSearchesObservable = this.userProfileService.getRecentSearchesForDisplay(searchType);
      const recentSearches = await (typeof recentSearchesObservable === 'object' && 'subscribe' in recentSearchesObservable
        ? import('rxjs').then(rxjs => rxjs.firstValueFrom(recentSearchesObservable))
        : Promise.resolve(recentSearchesObservable));
      const suggestions: Suggestion[] = recentSearches.map(this.convertRecentSearchToSuggestion);
      return {
        suggestions,
        metadata: {
          total_count: suggestions.length,
          search_term: '',
          response_time_ms: 0,
          cache_hit: true,
          hotels_count: suggestions.filter(s => s.type === 'HOTEL').length,
          cities_count: suggestions.filter(s => s.type === 'CITY').length
        }
      };
    } catch (error) {
      console.error('Error getting recent searches:', error);
      return {
        suggestions: [],
        metadata: {
          total_count: 0,
          search_term: '',
          response_time_ms: 0,
          cache_hit: false,
          hotels_count: 0,
          cities_count: 0
        }
      };
    }
  }

  private convertRecentSearchToSuggestion(search: any): Suggestion {
    return {
      id: `recent_${search.search_query}_${Date.now()}`,
      name: search.search_query,
      display_name: search.search_query,
      type: search.search_type === 'hotel' ? 'HOTEL' : 'CITY',
      score: 100,
      description: undefined,
      is_popular: false,
      city_code: undefined,
      city_name: undefined,
      hotel_code: undefined,
      star_rating: undefined,
      country_code: undefined,
      country_name: undefined,
      aliases: []
    };
  }

  async searchSuggestions(input: AutoSuggestInput, userProfileId?: string): Promise<AutoSuggestResponse> {
    const searchInput = { ...input };
    if (userProfileId) searchInput.userProfileId = userProfileId;
    if (searchInput.searchTerm.length < environment.minSearchLength) {
      return {
        suggestions: [],
        metadata: { total_count: 0, search_term: searchInput.searchTerm }
      };
    }

    const cacheKey = this.getCacheKey(searchInput);
    if (!userProfileId) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          suggestions: cached,
          metadata: {
            total_count: cached.length,
            search_term: searchInput.searchTerm,
            cache_hit: true
          }
        };
      }
    }

    try {
      const response: AxiosResponse<any> = await axios.post(environment.graphqlEndpoint, {
        query: this.buildGraphQLQuery(),
        variables: { input: searchInput }
      }, { headers: this.getHeaders() });

      const result = response.data?.data?.autoSuggest;
      if (!userProfileId) this.setCache(cacheKey, result.suggestions);
      return result;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return {
        suggestions: [],
        metadata: { total_count: 0, search_term: searchInput.searchTerm }
      };
    }
  }

  private buildGraphQLQuery(): string {
    return `
      query AutoSuggest($input: AutoSuggestInput!) {
        autoSuggest(input: $input) {
          suggestions {
            id name type score city_code city_name hotel_code star_rating is_popular
            country_code country_name aliases supplier_mappings description
          }
          metadata {
            total_count search_term response_time_ms cache_hit hotels_count cities_count
          }
        }
      }
    `;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-apollo-operation-name': 'AutoSuggest',
      'Accept': 'application/json'
    };
  }

  private getCacheKey(input: AutoSuggestInput): string {
    return JSON.stringify({
      searchTerm: input.searchTerm.toLowerCase().trim(),
      limit: input.limit,
      popular_only: input.popular_only,
      country_codes: input.country_codes?.sort(),
      metro_cities_only: input.metro_cities_only
    });
  }

  private getFromCache(key: string): Suggestion[] | null {
    const cached = this.cache.get(key);
    if (!cached || Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  private setCache(key: string, data: Suggestion[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}


interface EnrichedCacheEntry {
  data: any; // Replace 'any' with the actual type if known, e.g., EnrichedSuggestionData
  timestamp: number;
  userProfileId: string;
}
interface EnrichedCacheEntry {
  data: any; // Replace 'any' with the actual type if you define EnrichedSuggestionData elsewhere
  timestamp: number;
  userProfileId: string;
}
