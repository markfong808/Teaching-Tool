/* eslint-disable testing-library/prefer-find-by */
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ManagePrograms from '../components/ManagePrograms';

// Mock the global fetch function
global.fetch = jest.fn();

describe('ManagePrograms Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders the component', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]), // Assume an empty array of programs initially
    });

    render(<ManagePrograms />);
    await waitFor(() => {
      expect(screen.getByText(/Manage Programs/i)).toBeInTheDocument();
    });
  });

  test('fetches and displays program data', async () => {
    const mockPrograms = [
      { id: 1, name: 'Program 1', description: 'Description 1', duration: 60 },
      // Add more mock program data as needed
    ];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPrograms),
    });

    render(<ManagePrograms />);
    await waitFor(() => {
      expect(screen.getByText('Program 1')).toBeInTheDocument();
    });
  });


  test('deletes an existing program', async () => {
    const mockPrograms = [{ id: 1, name: 'Program to Delete', description: 'Description', duration: 60 }];
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPrograms) });
    fetch.mockResolvedValueOnce({ ok: true });
    global.confirm = jest.fn(() => true); // Mock confirmation to return true
    global.alert = jest.fn();

    const { getByText } = render(<ManagePrograms />);
    // eslint-disable-next-line testing-library/prefer-screen-queries
    await waitFor(() => expect(getByText('Program to Delete')).toBeInTheDocument());

    // eslint-disable-next-line testing-library/prefer-screen-queries
    fireEvent.click(getByText('Program to Delete'));
    // eslint-disable-next-line testing-library/prefer-screen-queries
    fireEvent.click(getByText('Delete Program'));

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalled();
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(fetch).toHaveBeenCalledWith('/program/1', expect.any(Object));
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(global.alert).toHaveBeenCalledWith('Program deleted successfully!');
    });
  });

  // Add more tests as needed
});
