import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import FlightSearch from './components/FlightSearch/FlightSearch';
import HotelSearch from './components/HotelSearch/HotelSearch';
import BusSearch from './components/BusSearch/BusSearch';

const AppRoutes = () => (
  <BrowserRouter>
    <Navbar />
    <Switch>
      <Route path="/flights" component={FlightSearch} />
      <Route path="/hotels" component={HotelSearch} />
      <Route path="/buses" component={BusSearch}/>
    </Switch>
  </BrowserRouter>
);

export default AppRoutes;
