import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Logout from '../components/Logout';

// Mock fetch and useNavigate
global.fetch = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('Logout Component', () => {
  const mockSetUser = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    fetch.mockClear();
    mockSetUser.mockClear();
    mockNavigate.mockClear();
  });

  test('successfully logs out the user', async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    render(
      <Router>
        <UserContext.Provider value={{ setUser: mockSetUser }}>
          <Logout />
        </UserContext.Provider>
      </Router>
    );

    expect(fetch).toHaveBeenCalledWith('/logout', expect.any(Object));

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith(null);
    });
  });

});
