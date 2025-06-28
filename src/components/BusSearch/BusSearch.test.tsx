import React from 'react';
import { render, screen } from '@testing-library/react';
import BusSearch from './BusSearch';

test('renders bus search title', () => {
  expect(screen.getByText(/Search Buses/i)).toBeInTheDocument();
});
