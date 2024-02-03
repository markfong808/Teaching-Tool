import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { capitalizeFirstLetter } from '../utils/FormatDatetime';
import { getCookie } from '../utils/GetCookie';
import { Tooltip } from './Tooltip';

export default function Profile() {
  const { user, setUser } = useContext(UserContext);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    about: user?.about || '',
    linkedin_url: user?.linkedin_url || '',
    meeting_url: user?.meeting_url || '',
    auto_approve_appointments: Boolean(user?.auto_approve_appointments),
  });
  const [limitData, setLimitData] = useState({
    daily_limit: '',
    weekly_limit: '',
    total_limit: '',
  });
  const [changesMade, setChangesMade] = useState(false);
  const [limitChangesMade, setLimitChangesMade] = useState(false);

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


  const fetchLimits = async () => {
    const csrfToken = getCookie('csrf_access_token');
    try {
      const response = await fetch('/mentor/meeting/limits', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Limit fetch failed');
      }

      const limitData = await response.json();
      setLimitData({
        daily_limit: limitData.daily_limit || '',
        weekly_limit: limitData.weekly_limit || '',
        total_limit: limitData.total_limit || '',
      });
    } catch (error) {
      console.error('Error fetching limits:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLimits();
    }
  }, [user]);

  const handleLimitInputChange = (e) => {
    const { name, value } = e.target;
    let newLimitData = { ...limitData, [name]: parseInt(value, 10) || 0 };

    // Ensure daily limit doesn't exceed weekly or total limit
    if (name === 'daily_limit') {
      if (newLimitData.daily_limit > newLimitData.weekly_limit) {
        newLimitData.weekly_limit = newLimitData.daily_limit;
      }
      if (newLimitData.daily_limit > newLimitData.total_limit) {
        newLimitData.total_limit = newLimitData.daily_limit;
      }
    }

    // Ensure weekly limit is between daily limit and total limit
    if (name === 'weekly_limit') {
      if (newLimitData.weekly_limit < newLimitData.daily_limit) {
        newLimitData.daily_limit = newLimitData.weekly_limit;
      }
      if (newLimitData.weekly_limit > newLimitData.total_limit) {
        newLimitData.total_limit = newLimitData.weekly_limit;
      }
    }

    // Ensure total limit isn't less than daily or weekly limit
    if (name === 'total_limit') {
      if (newLimitData.total_limit < newLimitData.daily_limit) {
        newLimitData.daily_limit = newLimitData.total_limit;
      }
      if (newLimitData.total_limit < newLimitData.weekly_limit) {
        newLimitData.weekly_limit = newLimitData.total_limit;
      }
    }

    setLimitData(newLimitData);
    setLimitChangesMade(true);
  };


  const handleCancelLimitChanges = () => {
    // Reset form data to initial user data
    fetchLimits();
    setLimitChangesMade(false); // Reset changes made
  };


  const SaveLimitChanges = async () => {
    const updatedLimitData = {
      ...limitData,
    };
    //alert("Limit changes saved: " + limitData.daily_limit + " " + limitData.weekly_limit + " " + limitData.total_limit);
    const csrfToken = getCookie('csrf_access_token');
    try {
      const response = await fetch('/mentor/meeting/limits', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(updatedLimitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Limit update failed');
      }
      setLimitChangesMade(false); // Reset changes made
      alert("Limit Changes Saved!")
    }
    catch (error) {
      console.error('Error updating profile:', error);
    }
  };

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
    try {
      const response = await fetch('/profile/update', {
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
      setUser((currentUser) => ({ ...currentUser, ...updatedUser }));
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="flex flex-col w-2/3 m-auto">
      <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md">
        <h2 className='pb-10 text-center font-bold text-2xl'>Account Settings</h2>
        <div className="flex flex-col">
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
            Email
          </label>
          <input className='bg-gray border border-light-gray mb-3' type="text" name="email" value={user?.email} disabled />

          <label className='font-bold'>
            Account Type
          </label>
          <input className='bg-gray border border-light-gray mb-3' type='text' name='type' value={capitalizeFirstLetter(user?.account_type)} disabled />

          <div>
            <label className='font-bold'>
              About Me&nbsp;
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
              Social URL&nbsp;
            </label>
            <Tooltip text="Please provide only one URL of your choice - LinkedIn, GitHub, etc.">
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
              Your Personal Meeting URL&nbsp;
            </label>
            <Tooltip text="Please provide only one URL of your choice - Zoom, Teams, etc.">
              <span>
                ⓘ
              </span>
            </Tooltip>
          </div>
          <input className='border border-light-gray'
            type="text"
            name="meeting_url"
            value={formData.meeting_url}
            onChange={handleInputChange}
          />

          {user?.account_type === 'mentor' && (
            <div className=''>
              <label className='font-bold'>Auto-accept meeting requests?</label>
              <br />
              <label>
                Yes
                <input className='mb-3'
                  type="radio"
                  name="auto_approve_appointments"
                  value="true"
                  checked={formData.auto_approve_appointments === true}
                  onChange={handleInputChange}
                />
              </label>
              &nbsp;&nbsp;
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
          )}
          {changesMade && (
            <div className="flex flex-row justify-end my-5">
              <button className="bg-purple text-white rounded-md p-2 mr-2 hover:text-gold" onClick={handleSaveChanges}>Save Account Changes</button>
              <button className="bg-purple text-white rounded-md p-2 hover:text-gold" onClick={handleCancelChanges}>Discard Account Changes</button>
            </div>
          )}
          {user?.account_type === 'mentor' && (
            <div className="flex flex-col">
              <h2 className='font-bold'>Set Meeting Limits</h2>
              <div className='flex flex-row justify-between'>
                <div className='flex flex-col mr-5'>
                  <label>
                    Max Daily
                  </label>
                  <input className='border border-light-gray'
                    type='number'
                    name="daily_limit"
                    min="1"
                    value={limitData.daily_limit}
                    onChange={handleLimitInputChange}
                  />

                </div>
                <div className='flex flex-col mr-5'>
                  <label>
                    Max Weekly
                  </label>
                  <input className='border border-light-gray'
                    type='number'
                    name="weekly_limit"
                    min="1"
                    value={limitData.weekly_limit}
                    onChange={handleLimitInputChange}
                  />

                </div>
                <div className='flex flex-col'>
                  <label>
                    Max Total
                  </label>
                  <input className='border border-light-gray'
                    type='number'
                    name="total_limit"
                    min="1"
                    value={limitData.total_limit}
                    onChange={handleLimitInputChange}
                  />
                </div>
              </div>
            </div>
          )}
          {limitChangesMade && (
            <div className="flex justify-end mt-5">
              <button className="bg-purple text-white rounded-md p-2 mr-2 hover:text-gold" onClick={SaveLimitChanges}>Save Limit Changes</button>
              <button className="bg-purple text-white rounded-md p-2 mr-2 hover:text-gold" onClick={handleCancelLimitChanges}>Discard Limit Changes</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
