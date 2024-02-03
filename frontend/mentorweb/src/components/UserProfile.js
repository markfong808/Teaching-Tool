import React, { useState, useEffect } from 'react';
import { capitalizeFirstLetter } from '../utils/FormatDatetime';
import { getCookie } from '../utils/GetCookie';
import { Tooltip } from './Tooltip';

export default function UserProfile({ user, onUserUpdate, onClose }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    about: user?.about || '',
    linkedin_url: user?.linkedin_url || '',
    meeting_url: user?.meeting_url || '',
    auto_approve_appointments: Boolean(user?.auto_approve_appointments),
  });
  const [changesMade, setChangesMade] = useState(false);

  useEffect(() => {
    // Update form data when user context updates
    if (user) {
      setFormData({
        name: user.name || '',
        about: user.about || '',
        linkedin_url: user.linkedin_url || '',
        meeting_url: user.meeting_url || '',
        auto_approve_appointments: Boolean(user.auto_approve_appointments),
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;

    // Handle the radio button specifically
    if (type === 'radio') {
      newValue = value === 'true'; // Convert the value to boolean
    } else {
      // For other inputs, just use the value
      newValue = value;
    }

    setFormData({ ...formData, [name]: newValue });

    // Check if changes were made
    const formIsSameAsUser = (
      (name === 'name' && value === user.name) ||
      (name === 'about' && value === user.about) ||
      (name === 'linkedin_url' && value === user.linkedin_url) ||
      (name === 'meeting_url' && value === user.meeting_url) ||
      (name === 'auto_approve' && newValue === user.auto_approve_appointments) // Use newValue for comparison
    );

    // Set changesMade to true if form data does not match initial user data
    setChangesMade(!formIsSameAsUser);
  };


  const handleCancelChanges = () => {
    // Reset form data to initial user data
    setFormData({
      name: user.name || '',
      about: user.about || '',
      linkedin_url: user.linkedin_url || '',
      meeting_url: user.meeting_url || '',
      auto_approve_appointments: Boolean(user?.auto_approve_appointments),
    });
    setChangesMade(false); // Reset changes made
  };

  const handleSaveChanges = async () => {
    const updatedFormData = {
      ...formData,
      auto_approve_appointments: formData.auto_approve_appointments ? 1 : 0,
    };
    const csrfToken = getCookie('csrf_access_token');
    const userID = user.id;
    try {
      const url = `/profile/update/${userID}`;
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(updatedFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Profile update failed');
      }
      setChangesMade(false); // Reset changes made
      // Update the user context with the new data
      const updatedUser = await response.json();
      onUserUpdate(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="flex flex-col p-5 w-2/3 m-auto border border-light-gray rounded-md shadow-md">
      <div className="flex flex-row">
        <h1 className='font-bold m-auto text-2xl'>Account Details</h1>
        <div className='cursor-pointer' onClick={onClose}>
          <i className="fas fa-times"></i>
        </div>        
      </div>
      
      <label className='font-bold'>
        Name
      </label>
      <input className='border border-light-gray mb-3'
        type="text"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
      />

      <label className='font-bold'>
        ID
      </label>
      <input className='border border-light-gray bg-gray mb-3'
        type="text"
        name="id"
        value={user.id}
        disabled
      />

      <label className='font-bold'>
        Email
      </label>
      <input className='border border-light-gray bg-gray mb-3'
        type="text"
        name="email"
        value={user?.email}
        disabled
      />

      <label className='font-bold'>
        Account Type
      </label>
      <input className='border border-light-gray bg-gray mb-3'
        type='text'
        name='type'
        value={capitalizeFirstLetter(user?.account_type)}
        disabled
      />

      <div>
        <label className='font-bold'>
          About Me
        </label>
        <Tooltip text="Provide a brief introduction or summary about yourself">
          <span>
            ⓘ
          </span>
        </Tooltip>
      </div>
      <textarea className='border border-light-gray mb-3'
        name="about"
        value={formData.about}
        onChange={handleInputChange}
      />
      <div>
        <label className='font-bold'>
          Social URL
        </label>
        <Tooltip text="Provide a link to your LinkedIn profile">
          <span>
            ⓘ
          </span>
        </Tooltip>
      </div>
      <input className='border border-light-gray mb-3'
        type="text"
        name="linkedin_url"
        value={formData.linkedin_url}
        onChange={handleInputChange}
      />
      <div>
        <label className='font-bold'>
          Your Personal Meeting URL
        </label>
        <Tooltip text="Provide a link to your personal meeting URL">
          <span>
            ⓘ
          </span>
        </Tooltip>
      </div>
      <input className='border border-light-gray mb-3'
        type="text"
        name="meeting_url"
        value={formData.meeting_url}
        onChange={handleInputChange}
      />
      {user?.account_type === 'mentor' && (
        <div className="flex flex-col">
          <label className='font-bold'>Auto-accept meeting requests?</label>
          <div>
          <label>
            Yes
            <input
              type="radio"
              name="auto_approve_appointments"
              value="true" // Keep the value as string 'true' to match handleInputChange
              checked={formData.auto_approve_appointments === true}
              onChange={handleInputChange}
            />
          </label>
          <label>
            No
            <input
              type="radio"
              name="auto_approve_appointments"
              value="false"
              checked={formData.auto_approve_appointments === false}
              onChange={handleInputChange}
            />
          </label>
          </div>
        </div>
      )}
      {changesMade && (
        <div className="flex justify-end">
          <button className='bg-purple text-white hover:text-gold rounded-md p-2'
            onClick={handleSaveChanges}>
            Save Changes
          </button>
          <button className='bg-purple text-white hover:text-gold rounded-md p-2 ml-2'
            onClick={handleCancelChanges}>
            Cancel Changes
          </button>
        </div>
      )}
    </div>
  );
}
