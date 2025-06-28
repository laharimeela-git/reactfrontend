// src/components/FlightSearch/FlightSearch.tsx
import React, { useState, useEffect } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import './FlightSearch.module.scss';
interface Suggestion {
  id: string;
  name: string;
  type: string;
}

interface FlightSearchProps extends RouteComponentProps {
  title: string;
}

const FlightSearch: React.FC<FlightSearchProps> = ({ title, history, location }) => {
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [departureDate, setDepartureDate] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>('');
  const [selectedTripType, setSelectedTripType] = useState('Return');

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [selectedCabinClass, setSelectedCabinClass] = useState('Economy');
  const [showTripDropdown, setShowTripDropdown] = useState(false);
  const [showTravellersDropdown, setShowTravellersDropdown] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setFromCity(params.get('from') || '');
    setToCity(params.get('to') || '');
    setDepartureDate(params.get('departure') || '');
    setReturnDate(params.get('return') || '');
    setAdults(Number(params.get('adults')) || 1);
    setChildren(Number(params.get('children')) || 0);
    setInfants(Number(params.get('infants')) || 0);
    setSelectedCabinClass(params.get('cabinClass') || 'Economy');
    setSelectedTripType(params.get('tripType') || 'Return');
    // eslint-disable-next-line
  }, [location.search]);

  const swapCities = () => {
    setIsSwapping(true);
    const tempFrom = fromCity;
    const tempTo = toCity;
    setFromCity(tempTo);
    setToCity(tempFrom);
    setTimeout(() => setIsSwapping(false), 300);
  };

  const getTravellersText = () => {
    const adultText = adults === 1 ? 'Adult' : 'Adults';
    return `${adults} ${adultText}, ${selectedCabinClass}`;
  };
const buildQueryParams = () => {
  const params: Record<string, string> = {};

  if (fromCity) params.from = fromCity;
  if (toCity) params.to = toCity;
  if (departureDate) params.departure = departureDate;
  if (selectedTripType === 'Return' && returnDate) params.return = returnDate;

  params.adults = String(adults);
  params.children = String(children);
  params.infants = String(infants);
  params.cabinClass = selectedCabinClass;
  params.tripType = selectedTripType;

  return params;
};

const onSearchFlight = () => {
  const queryParams = buildQueryParams();
  const searchParams = new URLSearchParams(queryParams).toString();
  history.push(`/flights?${searchParams}`);
};

  // const onSearchFlight = () => {
  //   const query = new URLSearchParams({
  //     from: fromCity,
  //     to: toCity,
  //     departure: departureDate,
  //     return: returnDate,
  //     adults: String(adults),
  //     children: String(children),
  //     infants: String(infants),
  //     cabinClass: selectedCabinClass,
  //     tripType: selectedTripType
  //   });
  //   history.push(`/flight?${query.toString()}`);
  // };

  return (
  <div className="flight-search-container">
    <div className="trip-type-section">
      <button className="trip-type-btn" onClick={() => setShowTripDropdown(!showTripDropdown)}>
        ✈ {selectedTripType} <span className="dropdown-arrow">▼</span>
      </button>
      {showTripDropdown && (
        <div className="trip-dropdown">
          {['Return', 'One Way', 'Multi City'].map(type => (
            <div key={type} className="trip-option" onClick={() => {
              setSelectedTripType(type);
              setShowTripDropdown(false);
              if (type !== 'Return') setReturnDate('');
            }}>
              {type}
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="search-form">
      <div className="search-row">
        <div className="search-field">
          <label className="field-label">From</label>
          <input
            type="text"
            className="field-input"
            placeholder="Enter the city"
            value={fromCity}
            onChange={e => setFromCity(e.target.value)}
          />
        </div>

        <div className="search-field">
          <label className="field-label">&nbsp;</label>
          <button className={`swap-btn ${isSwapping ? 'swapping' : ''}`} onClick={swapCities}>
            ⇄
          </button>
        </div>

        <div className="search-field">
          <label className="field-label">To</label>
          <input
            type="text"
            className="field-input"
            placeholder="Enter the city"
            value={toCity}
            onChange={e => setToCity(e.target.value)}
          />
        </div>

        <div className="search-field">
          <label className="field-label">Depart</label>
          <input
            type="date"
            className="date-input"
            value={departureDate}
            onChange={e => setDepartureDate(e.target.value)}
          />
        </div>

        {selectedTripType === 'Return' && (
          <div className="search-field">
            <label className="field-label">Return</label>
            <input
              type="date"
              className="date-input"
              value={returnDate}
              onChange={e => setReturnDate(e.target.value)}
            />
          </div>
        )}

        <div className="search-field travellers-field">
          <label className="field-label">Travellers and cabin class</label>
          <div className="field-value" onClick={() => setShowTravellersDropdown(!showTravellersDropdown)}>
            {getTravellersText()}
          </div>
          {showTravellersDropdown && (
            <div className="travellers-dropdown">
              <div className="traveller-row">
                <span className="traveller-type">Adults</span>
                <div className="counter">
                  <button className="counter-btn" onClick={() => setAdults(Math.max(1, adults - 1))}>-</button>
                  <span className="counter-value">{adults}</span>
                  <button className="counter-btn" onClick={() => setAdults(adults + 1)}>+</button>
                </div>
              </div>

              <div className="traveller-row">
                <span className="traveller-type">Children</span>
                <div className="counter">
                  <button className="counter-btn" onClick={() => setChildren(Math.max(0, children - 1))}>-</button>
                  <span className="counter-value">{children}</span>
                  <button className="counter-btn" onClick={() => setChildren(children + 1)}>+</button>
                </div>
              </div>

              <div className="traveller-row">
                <span className="traveller-type">Infants</span>
                <div className="counter">
                  <button className="counter-btn" onClick={() => setInfants(Math.max(0, infants - 1))}>-</button>
                  <span className="counter-value">{infants}</span>
                  <button className="counter-btn" onClick={() => setInfants(infants + 1)}>+</button>
                </div>
              </div>

              <div className="cabin-title">Cabin Class</div>
              <select className="cabin-dropdown" value={selectedCabinClass} onChange={e => setSelectedCabinClass(e.target.value)}>
                <option value="Economy">Economy</option>
                <option value="Premium Economy">Premium Economy</option>
                <option value="Business">Business</option>
                <option value="First">First</option>
              </select>
            </div>
          )}
        </div>

        <div className="search-btn-field">
          <button className="search-button" onClick={onSearchFlight}>Search</button>
        </div>
      </div>
    </div>
  </div>
);

};

export default withRouter(FlightSearch);
