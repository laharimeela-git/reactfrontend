import React from 'react';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import './Navbar.css';
import hypermileLogo from '../../assets/hypermilelogo.png'; // adjust path based on file structure

const Navbar: React.FC<RouteComponentProps> = ({ location }) => {
  return (
    <nav className="navbar">
      <div className="logo">
        <img src={hypermileLogo} alt="Hypermile Logo" />
      </div>
      <div className="nav-links">
        <Link to="/flights" className={location.pathname === '/flights' ? 'active' : ''}>Flight</Link>
        <Link to="/hotels" className={location.pathname === '/hotels' ? 'active' : ''}>Hotels</Link>
        <Link to="/buses" className={location.pathname === '/buses' ? 'active' : ''}>Buses</Link>
      </div>
    </nav>
  );
};

export default withRouter(Navbar);
