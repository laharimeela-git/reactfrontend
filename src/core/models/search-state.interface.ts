import { Suggestion, ResponseMetadata } from './suggestion.interface';

/**
 * Represents the current state of the auto-suggest component
 */
export interface AutoSuggestState {
  /** Current search term entered by the user */
  searchTerm: string;

  /** Current list of suggestions displayed to the user */
  suggestions: Suggestion[];

  /** Whether a search is currently in progress */
  isLoading: boolean;

  /** Index of the currently highlighted suggestion (-1 if none) */
  selectedIndex: number;

  /** Error message to display, or null if no error */
  error: string | null;

  /** Metadata from the most recent search response */
  metadata: ResponseMetadata | null;

  /** Whether the dropdown is currently visible */
  isDropdownOpen: boolean;
}
