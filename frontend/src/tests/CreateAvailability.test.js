import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // Ensure jest-dom matchers are available
import CreateAvailability from '../components/CreateAvailability';

global.fetch = jest.fn(() => Promise.resolve({
    json: () => Promise.resolve({}),
}));

describe('CreateAvailability Component', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    test('renders the component', () => {
        render(<CreateAvailability />);
        expect(screen.getByLabelText(/Select Program Type:/i)).toBeInTheDocument();
    });

    test('selects a mentorship type and shows calendar', () => {
        render(<CreateAvailability />);
        fireEvent.change(screen.getByLabelText(/Select Program Type:/i), { target: { value: 'Mentoring Session' } });
        expect(screen.getByText(/Create your Mentoring Session availability/i)).toBeInTheDocument();
    });
});
