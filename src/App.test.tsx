import React from 'react';
import { render, screen } from '@testing-library/react';
// import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { MemoryRouter } from 'react-router-dom';

test('renders hotel search on root path', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByText(/Search Hotels/i)).toBeInTheDocument();
});
