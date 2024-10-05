import React, { useState } from 'react';
import moment from 'moment';
import '../styles/EventModal.css'; 
import Modal from 'react-modal';

// export default EventModal;
Modal.setAppElement('#root'); // This line is important for accessibility

const EventModal = ({ event, isOpen, onClose,onSave }) => {
  const [updatedEvent, setUpdatedEvent] = useState(event);

  const handleChange = (e) => {
    setUpdatedEvent({
      ...updatedEvent,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    onSave(updatedEvent);
  };
  
   // Destructure and provide default values to avoid undefined issues
  const {
    title = 'N/A',
    start,
    end,
    physical_location = 'N/A',
    organizer = { emailAddress: { name: 'N/A' } },
    body = { content: 'N/A' },
    attendees = []
  } = event || {};
  
  const attendeesText = attendees.length
    ? attendees.map(a => a.emailAddress?.name || 'Unknown').join(', ')
    : 'None';
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Event Details"
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)'
        }
      }}
    >
      <h2 style={{ color: 'purple', fontSize: '24px', marginBottom: '20px' }}>Event Details</h2>
      {event && (
        <div>
          <p><strong>Title:</strong> {event.title}</p>
          <p><strong>Start:</strong> {moment(event.start).format('hh:mm A')}</p>
          <p><strong>End:</strong> {moment(event.end).format('hh:mm A')}</p>
          <p><strong>Location:</strong> {event.location}</p> 
          <p><strong>Organizer:</strong> {event.organizerName} ({event.organizerEmail})</p>
          {/* <p><strong>Organizer:</strong> {'John'}</p> */}

          <p><strong>Description notes:  </strong> </p>
          <p>{event.notes}</p>
          <p><strong>Attendees:</strong> {attendeesText} </p>
          {/* <p><strong>Attendees:</strong> Liam , Sarah , Kenny</p> */}


        </div>
      )}
<button
        onClick={onClose}
        style={{
          backgroundColor: '#0078d4',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Close
      </button>   

       </Modal>
  );
};

export default EventModal;
