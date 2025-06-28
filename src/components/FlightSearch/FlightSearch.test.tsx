import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FlightSearch from './FlightSearch';

test('renders flight search title', () => {
  expect(screen.getByText(/Search Flights/i)).toBeInTheDocument();
});

