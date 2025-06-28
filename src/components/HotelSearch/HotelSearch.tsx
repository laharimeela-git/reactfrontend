import React, { useEffect, useState } from 'react';
import styles from './HotelSearch.module.scss';
import { withRouter, RouteComponentProps } from 'react-router-dom';

type Suggestion = {
  id: string;
  name: string;
  type: 'CITY' | 'HOTEL';
  city_name?: string;
  country_name?: string;
  star_rating?: number;
};

const HotelSearch: React.FC<RouteComponentProps> = ({ history, location }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // mock
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [searchedSuggestion, setSearchedSuggestion] = useState<Suggestion | null>(null);
  const [searchedCityHotels, setSearchedCityHotels] = useState<Suggestion[]>([]);
  const [isCitySearchResult, setIsCitySearchResult] = useState(false);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [noOfNights, setNoOfNights] = useState(1);
  const [showTravellerDropdown, setShowTravellerDropdown] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  // Calculate nights
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const inDate = new Date(checkInDate);
      const outDate = new Date(checkOutDate);
      const diff = Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 3600 * 24));
      setNoOfNights(diff > 0 ? diff : 1);
    }
  }, [checkInDate, checkOutDate]);

  const getTravellersLabel = () => {
    return `${adults} Adult${adults > 1 ? 's' : ''}, ${children} Child${children !== 1 ? 'ren' : ''}, ${rooms} Room${rooms > 1 ? 's' : ''}`;
  };

  const formatDate = (date: string) => {
    return date ? new Date(date).toISOString().split('T')[0] : '';
  };

  // const buildQueryParams = () => {
  //   const params: Record<string, string> = {};
  //   const suggestion = selectedSuggestion || searchedSuggestion;

  //   if (suggestion) {
  //     if (suggestion.type === 'HOTEL') {
  //       params.hotelId = suggestion.id;
  //       params.hotelName = suggestion.name;
  //       params.city = suggestion.city_name || '';
  //       params.country = suggestion.country_name || '';
  //     } else {
  //       params.city = suggestion.name || suggestion.city_name || '';
  //       params.country = suggestion.country_name || '';
  //     }
  //   } else if (currentSearchTerm) {
  //     params.searchTerm = currentSearchTerm;
  //   }

  //   if (checkInDate) params.checkin = formatDate(checkInDate);
  //   if (checkOutDate) params.checkout = formatDate(checkOutDate);
  //   if (noOfNights > 0) params.nights = String(noOfNights);
  //   params.travellers = getTravellersLabel();

  //   return params;
  // };
const buildQueryParams = () => {
  const params: Record<string, string> = {};
  const suggestion = selectedSuggestion || searchedSuggestion;

  // If a hotel or city is selected, use its details
  if (suggestion) {
    if (suggestion.type === 'HOTEL') {
      params.hotelId = suggestion.id;
      params.hotelName = suggestion.name;
      if (suggestion.city_name) params.city = suggestion.city_name;
      if (suggestion.country_name) params.country = suggestion.country_name;
    } else {
      params.city = suggestion.name || suggestion.city_name || '';
      if (suggestion.country_name) params.country = suggestion.country_name;
    }
  } else if (currentSearchTerm) {
    // If user typed a search term but didn't select a suggestion
    params.searchTerm = currentSearchTerm;
  }

  // Dates
  if (checkInDate) params.checkin = formatDate(checkInDate);
  if (checkOutDate) params.checkout = formatDate(checkOutDate);

  // Nights
  if (noOfNights > 0) params.nights = String(noOfNights);

  // Travellers
  params.adults = String(adults);
  params.children = String(children);
  params.rooms = String(rooms);

  return params;
};

  const handleSearchClick = () => {
    if (!selectedSuggestion && !searchedSuggestion && !currentSearchTerm) {
      return;
    }

    const queryParams = buildQueryParams();
    const searchParams = new URLSearchParams(queryParams).toString();
    history.push(`/hotels?${searchParams}`);
  };

  function increase(type: string) {
    if (type === 'adults') setAdults(adults + 1);
    if (type === 'children') setChildren(children + 1);
    if (type === 'rooms') setRooms(rooms + 1);
  }

  function decrease(type: string) {
    if (type === 'adults' && adults > 1) setAdults(adults - 1);
    if (type === 'children' && children > 0) setChildren(children - 1);
    if (type === 'rooms' && rooms > 1) setRooms(rooms - 1);
  }

  return (
    <div className={styles.hotelSearch}>
      <div className={styles.welcomeSection}>
        <p className={styles.welcomeText}>
          {isAuthenticated
            ? `Welcome back, John!`
            : 'Sign in to personalize your experience.'}
        </p>
      </div>

      {isAuthenticated && (
        <div className={styles.searchSection}>
          <form className={styles.hotelSearchForm} onSubmit={e => e.preventDefault()}>
            <input
              className={styles.autoSuggest}
              placeholder="Type to search for hotels or cities..."
              value={currentSearchTerm}
              onChange={e => setCurrentSearchTerm(e.target.value)}
            />

            <div>
              <label>Check-In</label>
              <input
                type="date"
                value={checkInDate}
                onChange={e => setCheckInDate(e.target.value)}
              />
            </div>

            <div>
              <label>Check-Out</label>
              <input
                type="date"
                value={checkOutDate}
                onChange={e => setCheckOutDate(e.target.value)}
              />
            </div>

            <div>
              <label>No. of Nights</label>
              <input type="number" value={noOfNights} readOnly />
            </div>

            <div onClick={() => setShowTravellerDropdown(!showTravellerDropdown)}>
              <label>Travellers</label>
              <input type="text" value={getTravellersLabel()} readOnly />
            </div>

            {showTravellerDropdown && (
              <div className={styles.travellersContainer}>
                {['adults', 'children', 'rooms'].map(type => (
                  <div key={type} className={styles.travellerGroup}>
                    <label>{type.charAt(0).toUpperCase() + type.slice(1)}</label>
                    <div className={styles.counter}>
                      <button type="button" onClick={() => decrease(type)}>−</button>
                      <span>
                        {type === 'adults' ? adults : type === 'children' ? children : rooms}
                      </span>
                      <button type="button" onClick={() => increase(type)}>+</button>
                    </div>
                  </div>
                ))}
                <button type="button" className={styles.doneBtn} onClick={() => setShowTravellerDropdown(false)}>
                  Apply
                </button>
              </div>
            )}

            <button type="button" className={styles.searchBtn} onClick={handleSearchClick}>
              Search Hotels
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default withRouter(HotelSearch);
