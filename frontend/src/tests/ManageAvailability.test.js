import React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ManageAvailability from '../components/ManageAvailability';
import { UserContext } from '../context/UserContext';


global.fetch = jest.fn();
const renderComponent = (user = null) => {
  return render(
    <UserContext.Provider value={{ user }}>
      <ManageAvailability />
    </UserContext.Provider>
  );
};

describe('ManageAvailability Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders the component', () => {
    renderComponent();
    expect(screen.getByText(/Manage Availability/i)).toBeInTheDocument();
  });

  test('fetches and displays availability data', async () => {
    const mockData = {
      mentor_availability: [
        { id: 1, type: 'Mentoring Session', date: '2023-09-01', start_time: '10:00', end_time: '10:30' },
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData)
    });

    renderComponent({ id: 1 }); 

    await waitFor(() => {
      expect(screen.getByText('Mentoring Session')).toBeInTheDocument();
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(screen.getByText('Friday')).toBeInTheDocument(); // Based on the date '2023-09-01'
    });
  });

  test('deletes availability on delete button click', async () => {
    const mockData = {
      mentor_availability: [
        { id: 1, type: 'Mentoring Session', date: '2023-09-01', start_time: '10:00', end_time: '10:30' }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData)
    });

    fetch.mockResolvedValueOnce({
      ok: true
    });

    global.confirm = jest.fn(() => true);
    global.alert = jest.fn(); 

    renderComponent({ id: 1 });

    await waitFor(() => {
      // eslint-disable-next-line testing-library/no-wait-for-side-effects
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(global.confirm).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith('/mentor/delete-availability/1', expect.any(Object));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Availability deleted successfully!');
    });
  });
});
