import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Login from "../components/Login";

global.fetch = require('jest-fetch-mock');

describe('Login Component', () => {
  const mockSetUser = jest.fn();

  beforeEach(() => {
    fetch.resetMocks();
  });

  const renderComponent = () =>
    render(
      <Router>
        <UserContext.Provider value={{ setUser: mockSetUser }}>
          <Login />
        </UserContext.Provider>
      </Router>
    );

  test('renders login form', () => {
    renderComponent();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('submits form and calls API', async () => {
    renderComponent();

    fetch.mockResponseOnce(JSON.stringify({ account_type: 'student' }));

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    expect(fetch).toHaveBeenCalledWith('/login', expect.any(Object));
  });

});
