import React, { useEffect, useState } from 'react';
import styles from './BusSearch.module.scss';
import { withRouter, RouteComponentProps } from 'react-router-dom';

const BusSearch: React.FC<RouteComponentProps> = ({ history, location }) => {
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [departureDate, setDepartureDate] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const from = params.get('from');
    const to = params.get('to');
    const date = params.get('date');
    if (from) setFromCity(from);
    if (to) setToCity(to);
    if (date) setDepartureDate(date);
  }, [location.search]);

  // Helper to build query params object
  const buildQueryParams = () => {
    const params: Record<string, string> = {};
    if (fromCity) params.from = fromCity;
    if (toCity) params.to = toCity;
    if (departureDate) params.date = departureDate;
    return params;
  };

  const onSearchBus = () => {
    const queryParams = buildQueryParams();
    const searchParams = new URLSearchParams(queryParams).toString();
    history.push(`/buses?${searchParams}`);
  };

  return (
    <div className={styles.busSearchContainer}>
      <form className={styles.busSearchBar} autoComplete="off" onSubmit={e => e.preventDefault()}>
        <div className={styles.busField}>
          <label>From</label>
          <input
            type="text"
            placeholder="Departure City"
            value={fromCity}
            onChange={e => setFromCity(e.target.value)}
          />
        </div>
        <div className={styles.busField}>
          <label>To</label>
          <input
            type="text"
            placeholder="Destination City"
            value={toCity}
            onChange={e => setToCity(e.target.value)}
          />
        </div>
        <div className={styles.busField}>
          <label>Departure Date</label>
          <input
            type="date"
            value={departureDate}
            onChange={e => setDepartureDate(e.target.value)}
          />
        </div>
        <button
          type="button"
          className={styles.busSearchBtn}
          onClick={onSearchBus}
          disabled={!fromCity || !toCity}
        >
          Search Buses
        </button>
      </form>
    </div>
  );
};

export default withRouter(BusSearch);
