import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import FlightSearch from './components/FlightSearch/FlightSearch.tsx';
import HotelSearch from './components/HotelSearch/HotelSearch.tsx';
import BusSearch from './components/BusSearch/BusSearch.tsx';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HotelSearch />} />
        <Route path="/hotel-search" element={<HotelSearch />} />
        <Route path="/bus-search" element={<BusSearch />} />

        <Route path="/flight-search" element={<FlightSearch title="Search Flights" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;