import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import FlightSearch from './components/FlightSearch/FlightSearch';
import HotelSearch from './components/HotelSearch/HotelSearch';
import BusSearch from './components/BusSearch/BusSearch';

const App = () => (
  <Router>
    <Navbar />
    <Switch>
      <Route path="/" exact component={HotelSearch} />
      <Route path="/flights" component={FlightSearch} />
      <Route path="/hotels" component={HotelSearch} />
      <Route path="/buses" component={BusSearch} />
    </Switch>
  </Router>
);

export default App;
