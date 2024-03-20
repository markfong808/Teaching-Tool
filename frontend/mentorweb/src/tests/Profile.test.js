import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserContext } from '../context/UserContext';

describe('Profile Component', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    about: 'Software Developer',
    linkedin_url: 'https://linkedin.com/in/johndoe',
    meeting_url: 'https://zoom.us/j/1234567890',
    auto_approve_appointments: true,
    account_type: 'mentor'
  };

  const mockSetUser = jest.fn();

  beforeEach(() => {
    // eslint-disable-next-line testing-library/no-render-in-setup
    render(
      <UserContext.Provider value={{ user: mockUser, setUser: mockSetUser }}>
       {/*<Profile /> */}
      </UserContext.Provider>
    );
  });

  test('renders the profile form with user data', () => {
    expect(screen.getByLabelText(/Name/i)).toHaveValue(mockUser.name);
    expect(screen.getByLabelText(/Email/i)).toHaveValue(mockUser.email);
    expect(screen.getByLabelText(/About Me/i)).toHaveValue(mockUser.about);
  });

  test('updates form fields and submits form', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ...mockUser, name: 'Jane Doe' }),
      })
    );

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Jane Doe' } });
    fireEvent.click(screen.getByText(/Save Changes/i));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/profile/update', expect.any(Object));
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(mockSetUser).toHaveBeenCalled();
    });
  });

  test('handles radio button change', () => {
    fireEvent.click(screen.getByLabelText(/No/i));
    expect(screen.getByLabelText(/No/i)).toBeChecked();
  });

  test('handles cancel changes', () => {
    fireEvent.change(screen.getByLabelText(/About Me/i), { target: { value: 'New Bio' } });
    fireEvent.click(screen.getByText(/Cancel Changes/i));
    expect(screen.getByLabelText(/About Me/i)).toHaveValue(mockUser.about);
  });
});
