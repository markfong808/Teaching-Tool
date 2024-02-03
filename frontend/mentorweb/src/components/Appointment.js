import React from 'react';
import { format } from 'date-fns';
import { capitalizeFirstLetter } from '../utils/FormatDatetime';

export default function Appointment({ resetBooking, mentorshipType, selectedTimeslot, notes, meetingURL, status }) {
  return (
    <div className='w-2/3 m-auto border border-light-gray rounded-md shadow-md p-5'>
      <div className='flex flex-row justify-between'>
        <h2 className='text-2xl'>Appointment Status: {capitalizeFirstLetter(status)}!</h2>
        <div className='cursor-pointer' onClick={resetBooking}>
          <i className="fas fa-times"></i>
        </div>
      </div>

      {
        status === "reserved" && (
          <p>Your appointment has been successfully booked. We are excited to assist you in your learning journey. Here are the details of your confirmed appointment:</p>
        )}
      {
        status === "pending" && (
          <p>Your appointment has not been approved yet. We will email you a confirmation once the mentor approves it. Here are the details of the appointment:</p>
        )}
      <div>
        <p><strong>Type:</strong> {mentorshipType}</p>
        <p><strong>Date:</strong> {format(selectedTimeslot.startTime, "PPPP")}</p>
        <p><strong>Time:</strong> {format(selectedTimeslot.startTime, 'p')} - {format(selectedTimeslot.availableTimeslot.endTime, 'p')}</p>
        <p><strong>Duration:</strong> {format(selectedTimeslot.availableTimeslot.endTime - selectedTimeslot.startTime, 'm')} minutes</p>
        <p><strong>Meeting URL:</strong> {meetingURL}</p>
        <p><strong>Notes:</strong> {notes}</p>
        <br />
      </div>
      <div className='my-5'>
        <h3 className='text-2xl'>Important Information:</h3>
        <ol>
          <li>Location: Please note that our mentoring sessions take place online. You will receive a separate email with the necessary information to connect with your mentor remotely.</li>
          <li>Preparation: Take some time to prepare for your session. Make sure you have any relevant materials, questions, or topics ready to discuss with your mentor.</li>
          <li>Timezone: Ensure that you have converted the appointment time to your local timezone to avoid any confusion. We want to ensure you connect with your mentor at the correct time.</li>
          <li>Confirmation Email: We have also sent you a confirmation email containing all the details of your appointment. Please keep it handy for reference.</li>
        </ol>
      </div>
      <p><strong>*If you need to update the URL for this meeting, you can easily do so at any time. Simply go to the 'Meetings' tab in your dashboard and select the appropriate meeting to modify its details.</strong></p>
    </div>
  );
};