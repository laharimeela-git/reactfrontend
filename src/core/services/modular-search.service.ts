// Converted React-compatible ModularSearchService (modularSearchService.ts)

import { Suggestion } from '../models/suggestion.interface';
import { UserProfileService } from './user-profile.service';
import { AutoSuggestService, SearchMode } from './auto-suggest.service';
import { firstValueFrom } from 'rxjs';

export enum SearchModule {
  FLIGHTS = 'flight',
  HOTELS = 'hotel',
  BUSES = 'bus',
}

export interface ModularSearchConfig {
  module: SearchModule;
  suggestionTypes: string[];
  maxRecentSearches?: number;
}

export class ModularSearchService {
  private recentSearchesCache = new Map<SearchModule, any[]>();
  private suggestionsCache = new Map<string, Suggestion[]>();

  constructor(
    private autoSuggestService: AutoSuggestService,
    private userProfileService: UserProfileService
  ) {
    Object.values(SearchModule).forEach((module) => {
      this.recentSearchesCache.set(module, []);
    });
  }

  async getModuleAutoSuggestions(query: string, config: ModularSearchConfig): Promise<Suggestion[]> {
    if (!query || query.length < 2) return [];

    const cacheKey = `${config.module}_${query}`;
    if (this.suggestionsCache.has(cacheKey)) {
      return this.suggestionsCache.get(cacheKey)!;
    }

    try {
      const response = await this.autoSuggestService.getSearchResults(query, SearchMode.AUTO_SUGGEST);
      const filteredSuggestions = response.suggestions.filter((s) => config.suggestionTypes.includes(s.type));
      this.suggestionsCache.set(cacheKey, filteredSuggestions);
      return filteredSuggestions;
    } catch (error) {
      console.error(`Error getting ${config.module} suggestions:`, error);
      return [];
    }
  }

  async getModuleRecentSearches(module: SearchModule): Promise<any[]> {
    const cached = this.recentSearchesCache.get(module);
    if (cached && cached.length > 0) return cached;
    return this.loadModuleRecentSearches(module);
  }

  // async loadModuleRecentSearches(module: SearchModule): Promise<any[]> {
  //   try {
  //     const searches = await this.userProfileService.getRecentSearchesForDisplay(module);
  //     const filtered = searches.filter((s: any) => s.search_type === module);
  //     this.recentSearchesCache.set(module, filtered);
  //     return filtered;
  //   } catch (error) {
  //     console.error(`Error loading ${module} recent searches:`, error);
  //     return [];
  //   }
  // }

async loadModuleRecentSearches(module: SearchModule): Promise<any[]> {
  try {
    const searches = await firstValueFrom(
      this.userProfileService.getRecentSearchesForDisplay(module)
    );

    const filtered = searches.filter((s: any) => s.search_type === module);
    this.recentSearchesCache.set(module, filtered);
    return filtered;
  } catch (error) {
    console.error(`Error loading ${module} recent searches:`, error);
    return [];
  }
}

  async saveModuleSearch(displayName: string, module: SearchModule, additionalData?: any): Promise<boolean> {
    try {
      const success = await this.userProfileService.saveActualSearchHistory(displayName, module, additionalData);
      if (success) await this.loadModuleRecentSearches(module);
      return success;
    } catch (error) {
      console.error(`Error saving ${module} search:`, error);
      return false;
    }
  }

  clearSuggestionsCache(module?: SearchModule, query?: string): void {
    if (module && query) {
      this.suggestionsCache.delete(`${module}_${query}`);
    } else if (module) {
      for (const key of Array.from(this.suggestionsCache.keys())) {
        if (key.startsWith(`${module}_`)) {
          this.suggestionsCache.delete(key);
        }
      }
    } else {
      this.suggestionsCache.clear();
    }
  }

  refreshModuleRecentSearches(module: SearchModule): void {
    this.loadModuleRecentSearches(module);
  }

  static getModuleConfig(module: SearchModule): ModularSearchConfig {
    switch (module) {
      case SearchModule.FLIGHTS:
        return { module, suggestionTypes: ['CITY', 'AIRPORT'], maxRecentSearches: 10 };
      case SearchModule.HOTELS:
        return { module, suggestionTypes: ['CITY', 'HOTEL', 'LANDMARK'], maxRecentSearches: 8 };
      case SearchModule.BUSES:
        return { module, suggestionTypes: ['CITY', 'BUS_STATION'], maxRecentSearches: 8 };
      default:
        return { module, suggestionTypes: ['CITY'], maxRecentSearches: 5 };
    }
  }
}
