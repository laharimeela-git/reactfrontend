import React, {
  useState, useEffect, useRef, useCallback, KeyboardEvent
} from 'react';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import {
  BehaviorSubject, Subject, of, from
} from 'rxjs';
import './AutoSuggest.scss';

// Interfaces (you can adjust as per your actual model)
interface Suggestion {
  id: string;
  name: string;
  display_name?: string;
  type: 'CITY' | 'HOTEL';
  score?: number;
  description?: string;
  city_name?: string;
  country_name?: string;
  star_rating?: number;
}

interface EnrichedSuggestionData {
  suggestion: Suggestion;
  relatedHotels?: Suggestion[];
  isCity?: boolean;
}

interface Props {
  placeholder?: string;
  limit?: number;
  minSearchLength?: number;
  onSelect: (s: Suggestion) => void;
  onSearch: (term: string, s?: Suggestion, enriched?: EnrichedSuggestionData) => void;
  fetchSuggestions: (term: string, limit: number) => Promise<{ suggestions: Suggestion[] }>;
  enrichSuggestion?: (term: string, type: 'CITY' | 'HOTEL') => Promise<EnrichedSuggestionData>;
  fetchRecent?: () => Promise<Suggestion[]>;
  isAuthenticated?: boolean;
}

const AutoSuggest: React.FC<Props> = ({
  placeholder = 'Search...',
  limit = 5,
  minSearchLength = 2,
  fetchSuggestions,
  onSelect,
  onSearch,
  enrichSuggestion,
  fetchRecent,
  isAuthenticated
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const search$ = useRef(new Subject<string>());
  const destroy$ = useRef(new Subject<void>());

  const handleSuggestionClick = async (suggestion: Suggestion) => {
    setInputValue(suggestion.name);
    setIsOpen(false);
    onSelect(suggestion);
    await triggerSearch(suggestion.name, suggestion);
  };

  const triggerSearch = async (term: string, selected?: Suggestion) => {
    let enriched: EnrichedSuggestionData | undefined;

    if (selected?.id.startsWith('recent_') && enrichSuggestion) {
      enriched = await enrichSuggestion(selected.name, selected.type);
      selected = enriched?.suggestion || selected;
    }

    onSearch(term, selected, enriched);
  };

  const loadRecent = async () => {
    if (isAuthenticated && fetchRecent) {
      setLoading(true);
      const recent = await fetchRecent();
      setSuggestions(recent.slice(0, 10));
      setIsOpen(true);
      setLoading(false);
    }
  };

  const setupSearchObservable = useCallback(() => {
    search$.current.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length < minSearchLength) {
          setSuggestions([]);
          setIsOpen(false);
          return of(null);
        }
        setLoading(true);
        return from(fetchSuggestions(term, limit));
      }),
      takeUntil(destroy$.current)
    ).subscribe(result => {
      if (result?.suggestions) {
        setSuggestions(result.suggestions);
        setIsOpen(true);
      }
      setLoading(false);
    });
  }, [fetchSuggestions, limit, minSearchLength]);

  useEffect(() => {
    setupSearchObservable();
    return () => destroy$.current.next();
  }, [setupSearchObservable]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setInputValue(term);
    search$.current.next(term);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = suggestions[highlightIndex] || {
        id: `manual_${Date.now()}`,
        name: inputValue,
        type: 'CITY'
      };
      handleSuggestionClick(selected);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 150);
  };

  const handleFocus = () => {
    if (inputValue === '' && isAuthenticated) {
      loadRecent();
    } else if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className="auto-suggest-container">
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="suggest-input"
      />

      {isOpen && (
        <ul className="suggestion-list" role="listbox">
          {loading && <li className="loading">Loading...</li>}
          {suggestions.map((s, index) => (
            <li
              key={s.id}
              className={`suggestion-item ${index === highlightIndex ? 'highlight' : ''}`}
              onClick={() => handleSuggestionClick(s)}
              role="option"
              aria-selected={index === highlightIndex}
            >
              <span className="name">{s.name}</span>
              <span className="type">{s.type}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutoSuggest;
