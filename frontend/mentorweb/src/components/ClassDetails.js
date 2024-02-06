import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { capitalizeFirstLetter } from '../utils/FormatDatetime';
import { getCookie } from '../utils/GetCookie';
import { Tooltip } from './Tooltip';
import WeeklyCalendar from './WeeklyCalendar';
import { ClassContext } from "../context/ClassContext.js";
import MeetingLocation from './MeetingLocation.js';
export default function ClassDetails() {
  const { user, setUser } = useContext(UserContext);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    linkedin_url: user?.linkedin_url || '',
    meeting_url: user?.meeting_url || '',
  });
  const [changesMade, setChangesMade] = useState(false);

  // set class instance
  const contextValue = useContext(ClassContext);
  const { classInstance } = contextValue || {};
  const [classData, setClass] = useState({
      info: classInstance?.class_comment || '',
      class_time: classInstance?.class_time || '',
      class_location: classInstance?.class_location || '',
      class_link: classInstance?.class_link || '',
      office_hours_time: classInstance?.office_hours_time || '',
      office_hours_location: classInstance?.office_hours_location || '',
      office_hours_link: classInstance?.office_hours_link || '',
      discord_link: classInstance?.discord_link || '',
  });

  useEffect(() => {
    // Update form data when user context updates
    if (user) {
      setFormData({
        name: user.name || '',
        about: user.about || '',
        linkedin_url: user.linkedin_url || '',
        meeting_url: user.meeting_url || '',
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
      (name === 'meeting_url' && value === user.meeting_url)
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
    <div className="flex flex-col w-7/8 m-auto">
      <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md">
        <h2 className='pb-10 text-center font-bold text-2xl'>Class Details</h2>
        <div className="flex flex-col">

          <div>
            <label className='font-bold'>
              Additional Comments &nbsp;
            </label>

            <Tooltip text="Additional comments displayed on the class webpage for students">
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
              Class Recording Link: &nbsp;
            </label>
            <Tooltip text="Please provide the URL where students can find class recordings">
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

          {/* Class Times */}
          <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
              <WeeklyCalendar isClassTimes={true}/>
          </div>

          {/* Office Hours Times */}
          <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
              <WeeklyCalendar isClassTimes={false}/>
          </div>

          {/* Meeting Location and Recording Link */}
          <div>
            <MeetingLocation />
          </div>
  
         

          {changesMade && (
            <div className="flex flex-row justify-end my-5">
              <button className="bg-purple text-white rounded-md p-2 mr-2 hover:text-gold" onClick={handleSaveChanges}>Save Class Changes</button>
              <button className="bg-purple text-white rounded-md p-2 hover:text-gold" onClick={handleCancelChanges}>Discard Class Changes</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
