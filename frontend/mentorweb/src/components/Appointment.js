import React from 'react';
import { format } from 'date-fns';
import { capitalizeFirstLetter } from '../utils/FormatDatetime';

export default function Appointment({ resetBooking, mentorshipType, selectedTimeslot, notes, meetingURL, status }) {
  return (
    <div className='fixed top-1/2 left-1/2 w-2/3 transform -translate-x-1/2 -translate-y-1/2 bg-gray border border-light-gray shadow-md p-5'>
      <div className='flex flex-row justify-between'>
        <h2 className='text-2xl'>Appointment Status: {capitalizeFirstLetter(status)}!</h2>
        <div className='cursor-pointer' onClick={resetBooking}>
          <i className="absolute top-1 right-1 fas fa-times"></i>
        </div>
      </div>

      {
        status === "reserved" && (
          <p>Your appointment has been successfully booked! Here are the details of your confirmed appointment:</p>
        )}
      {
        status === "pending" && (
          <p>Your appointment has not been approved yet. Here are the details of the appointment:</p>
        )}
      <div>
        <p><strong>Type:</strong> {mentorshipType}</p>
        <p><strong>Date:</strong> {format(selectedTimeslot.startTime, "PPPP")}</p>
        <p><strong>Time:</strong> {format(selectedTimeslot.startTime, 'p')} - {format(selectedTimeslot.availableTimeslot.endTime, 'p')}</p>
        <p><strong>Duration:</strong> {format(selectedTimeslot.availableTimeslot.endTime - selectedTimeslot.startTime, 'm')} minutes</p>
        <p><strong>Meeting URL:</strong> {meetingURL}</p>
        <p><strong>Notes:</strong> {notes}</p>
      </div>
    </div>
  );
};