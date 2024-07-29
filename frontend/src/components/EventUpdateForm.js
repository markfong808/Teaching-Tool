import React, { useState, useEffect } from "react";

const UpdateAppointmentForm = ({ appointmentId, onClose, csrfToken }) => {
  const [formData, setFormData] = useState({
    summary: '',
    start: '',
    end: '',
    attendees: [],
    notes: '',
  });
  
  useEffect(() => {
    // Fetch the existing appointment details when the component mounts
    const fetchAppointment = async () => {
      try {
        const response = await fetch(`/student/appointments/${appointmentId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch appointment details');
        }

        const data = await response.json();
        setFormData({
          summary: data.appointment_details.summary,
          start: data.appointment_details.start_time,
          end: data.appointment_details.end_time,
          attendees: data.appointment_details.attendees || [],
          notes: data.appointment_details.notes,
        });
      } catch (error) {
        console.error('Error fetching appointment details:', error);
      }
    };

    fetchAppointment();
  }, [appointmentId, csrfToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/student/appointments/update/${appointmentId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Appointment updated successfully!');
        onClose(); // Close the form/modal
      } else {
        throw new Error('Failed to update the appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <div>
          <label>Summary</label>
          <input
            type="text"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Start Time</label>
          <input
            type="datetime-local"
            name="start"
            value={formData.start}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>End Time</label>
          <input
            type="datetime-local"
            name="end"
            value={formData.end}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Attendees</label>
          <input
            type="text"
            name="attendees"
            value={formData.attendees.join(', ')}
            onChange={(e) => setFormData({ ...formData, attendees: e.target.value.split(', ') })}
          />
        </div>
        <div>
          <label>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Update Appointment</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

export default UpdateAppointmentForm;
