import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfile from '../components/UserProfile';

// Mock user object
const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  about: 'Software Engineer',
  linkedin_url: 'https://www.linkedin.com/in/johndoe',
  meeting_url: 'https://zoom.us/j/1234567890',
  auto_approve_appointments: true,
  account_type: 'mentor'
};

// Mock functions
const mockOnUserUpdate = jest.fn();
const mockOnClose = jest.fn();

describe('UserProfile Component', () => {
  beforeEach(() => {
    // eslint-disable-next-line testing-library/no-render-in-setup
    render(
      <UserProfile 
        user={mockUser} 
        onUserUpdate={mockOnUserUpdate} 
        onClose={mockOnClose} 
      />
    );
    global.fetch = jest.fn();
  });

  test('renders the component with user data', () => {
    expect(screen.getByLabelText(/Name/i).value).toBe(mockUser.name);
    expect(screen.getByLabelText(/Email/i).value).toBe(mockUser.email);
    // Add checks for other fields
  });

  test('updates input fields correctly', () => {
    fireEvent.change(screen.getByLabelText(/About Me/i), { target: { value: 'Updated about' } });
    expect(screen.getByLabelText(/About Me/i).value).toBe('Updated about');
    // Add checks for other input fields
  });

  test('calls onClose when close button is clicked', () => {
    // eslint-disable-next-line testing-library/no-node-access
    const closeButton = document.querySelector('.close-info-icon');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('handles save changes successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...mockUser, about: 'Updated about' }),
    });

    fireEvent.change(screen.getByLabelText(/About Me/i), { target: { value: 'Updated about' } });
    fireEvent.click(screen.getByText(/Save Changes/i));

    await waitFor(() => {
      expect(mockOnUserUpdate).toHaveBeenCalledWith({ ...mockUser, about: 'Updated about' });
    });
  });

  test('handles save changes failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Profile update failed' }),
    });

    fireEvent.change(screen.getByLabelText(/About Me/i), { target: { value: 'Updated about' } });
    fireEvent.click(screen.getByText(/Save Changes/i));
  });
});
