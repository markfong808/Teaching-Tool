import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Signup from '../components/Signup';

// Mocking window.location.href for redirection test
const mockLocationHref = jest.fn();
delete window.location;
window.location = { href: mockLocationHref };

// Mocking alert function
global.alert = jest.fn();

describe('Signup Component', () => {
  beforeEach(() => {
    // eslint-disable-next-line testing-library/no-render-in-setup
    render(<Signup />);
    global.fetch = jest.fn();
  });

  test('renders the component and input fields', () => {
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enter Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Verify Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Student/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mentor/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  test('updates input fields correctly', () => {
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test Name' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Enter Password/i), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText(/Verify Password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByLabelText(/Mentor/i));

    expect(screen.getByLabelText(/Name/i).value).toBe('Test Name');
    expect(screen.getByLabelText(/Email/i).value).toBe('test@example.com');
    expect(screen.getByLabelText(/Enter Password/i).value).toBe('password');
    expect(screen.getByLabelText(/Verify Password/i).value).toBe('password');
    expect(screen.getByLabelText(/Mentor/i).checked).toBeTruthy();
  });

  test('submits form and handles successful registration', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(global.alert).toHaveBeenCalledWith('Account created successfully. Login to your account now!');
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(window.location.href).toBe('/login');
    });
  });

  test('handles registration error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Registration failed' }),
    });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(screen.getByText('Registration failed')).toBeInTheDocument();
    });
  });

  test('handles network error', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(global.alert).toHaveBeenCalledWith('An error occurred. Please try again later.');
    });
  });
});
