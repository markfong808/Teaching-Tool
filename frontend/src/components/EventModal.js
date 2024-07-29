import React, { useState } from 'react';
import moment from 'moment';
import '../styles/EventModal.css'; 
import Modal from 'react-modal';
import {
  formatTime,
  formatDate,
  getDayFromDate,
  capitalizeFirstLetter,
} from "../utils/FormatDatetime.js";

Modal.setAppElement('#root'); // For accessibility

function EventModal({ event, isOpen, onClose, onSave }) {
  if (!event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Event Details"
      className="event-modal"
      overlayClassName="event-modal-overlay"
    >
      <h2>Event Details</h2>
      <div>
        <p><strong>Title:</strong> {event.title}</p>
        <p><strong>Start:</strong> {formatDate(event.start)} at {formatTime(event.start)}</p>
        <p><strong>End:</strong> {formatDate(event.end)} at {formatTime(event.end)}</p>
        <p><strong>Location:</strong> {event.physical_location || 'No location specified'}</p>
        <p><strong>Notes:</strong> {event.notes || 'No notes provided'}</p>
        <p><strong>Status:</strong> {event.status || 'No status available'}</p>
        <button onClick={() => onSave(event)}>Save Changes</button>
        <button onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

export default EventModal;
