/**
 * Represents a hotel or city suggestion returned from the API
 */
export interface Suggestion {
  display_name: string | undefined;
  /** Unique identifier for the suggestion */
  id: string;
  
  /** Display name of the hotel or city */
  name: string;
  
  /** Type of suggestion - either HOTEL or CITY */
  type: 'HOTEL' | 'CITY';
  
  /** Relevance score for the search (higher means more relevant) */
  score: number;
  
  /** City code if available (for both hotels and cities) */
  city_code?: string;
  
  /** City name (for hotels, or same as name for cities) */
  city_name?: string;
  
  /** Hotel code if available (for hotels only) */
  hotel_code?: string;
  
  /** Hotel star rating if available (for hotels only) */
  star_rating?: number;
  
  /** Flag indicating if this is a popular destination */
  is_popular: boolean;
  
  /** Country code in ISO format */
  country_code?: string;
  
  /** Country name */
  country_name?: string;
  
  /** Alternative names for this entity */
  aliases?: string[];
  
  /** Mapping to external supplier codes */
  supplier_mappings?: Record<string, any>;

  /** Description for recent searches */
  description?: string;
}

/**
 * Metadata returned with suggestion results
 */
export interface ResponseMetadata {
  /** Total number of matching results */
  total_count: number;
  
  /** The original search term used */
  search_term: string;
  
  /** Time taken to process the request in milliseconds */
  response_time_ms?: number;
  
  /** Whether this result was served from cache */
  cache_hit?: boolean;
  
  /** Number of hotels in the result set */
  hotels_count?: number;
  
  /** Number of cities in the result set */
  cities_count?: number;
}

/**
 * Complete response from the auto-suggest API
 */
export interface AutoSuggestResponse {
  /** List of matching suggestions */
  suggestions: Suggestion[];
  
  /** Response metadata and statistics */
  metadata: ResponseMetadata;
}

/**
 * Parameters for auto-suggest API requests
 */
export interface AutoSuggestInput {
  /** Search term to look for */
  searchTerm: string;
  
  /** Maximum number of results to return */
  limit?: number;
  
  /** Whether to only return popular destinations */
  popular_only?: boolean;
  
  /** Filter results to specific countries */
  country_codes?: string[];
  
  /** Whether to only return major cities */
  metro_cities_only?: boolean;

  /** User profile ID for personalized results (optional) */
  userProfileId?: string;
}

/**
 * Enriched suggestion data for consistent display
 * Used to address inconsistency between recent searches and auto-suggestions
 */
// export interface EnrichedSuggestionData {
//   /** The enriched suggestion with complete data */
//   suggestion?: Suggestion;
  
//   /** Related hotels if the suggestion is a city */
//   relatedHotels: Suggestion[];
  
//   /** Whether this is a city suggestion */
//   isCity: boolean;
  
//   /** Source of the enrichment data */
//   enrichmentSource?: string;
// } 