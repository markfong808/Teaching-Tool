import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { capitalizeFirstLetter } from '../utils/FormatDatetime';
import { getCookie } from '../utils/GetCookie';
import { Tooltip } from './Tooltip';
import WeeklyCalendar from './WeeklyCalendar';
import { ClassContext } from "../context/ClassContext.js";
import MeetingLocation from './MeetingLocation.js';


export default function ClassDetails() {
  // global
  const { user, setUser } = useContext(UserContext);
  const [changesMade, setChangesMade] = useState(false);

  // class variables
  const contextValue = useContext(ClassContext);
  const { classInstance } = contextValue || {};
  const [classData, setClassData] = useState({
    class_comment: classInstance?.class_comment || '',
    class_time: classInstance?.class_time || '',
    class_location: classInstance?.class_location || '',
    class_link: classInstance?.class_link || '',
    class_recordings_link: classInstance?.class_recordings_link || '',
    office_hours_time: classInstance?.office_hours_time || '',
    office_hours_location: classInstance?.office_hours_location || '',
    office_hours_link: classInstance?.office_hours_link || ''
  });


  useEffect(() => {
    // Update form data when user context updates
    if (user.account_type === "mentor") {
      setClassData({
        class_comment: classInstance?.class_comment || '',
        class_time: classInstance?.class_time || '',
        class_location: classInstance?.class_location || '',
        class_link: classInstance?.class_link || '',
        class_recordings_link: classInstance?.class_recordings_link || '',
        office_hours_time: classInstance?.office_hours_time || '',
        office_hours_location: classInstance?.office_hours_location || '',
        office_hours_link: classInstance?.office_hours_link || ''
      });
    }
  }, [user, classInstance]);

  // handle to update local variables when user is editing attributes
  const handleInputChange = (e) => {
    setClassData({ ...classData, [e.name]: e.value });
  };

  useEffect(() => {
    console.log(classData);
  }, [classData]);

  // handle to cancel webpage changes when user is done editing details
  const handleCancelChanges = () => {
    // Reset form data to initial class data
    setClassData({
      class_comment: classInstance.class_comment || '',
      class_time: classInstance.class_time || '',
      class_location: classInstance.class_location || '',
      class_link: classInstance.class_link || '',
      class_recordings_link: classInstance.class_recordings_link || '',
      office_hours_time: classInstance.office_hours_time || '',
      office_hours_location: classInstance.office_hours_location || '',
      office_hours_link: classInstance.office_hours_link || '',
    });
    setChangesMade(false); // Reset changes made
  };

  // handle to save webpage changes when user is done editing details
  const handleSaveChanges = async () => {
    const csrfToken = getCookie('csrf_access_token');
    try {
      const response = await fetch('/profile/update', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(classData),
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
            name="class_comment"
            value={classData.class_comment}
            onChange={handleInputChange}
          />


          {/* Class Times */}
          <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
            <WeeklyCalendar isClassTimes={true} />
          </div>

          {/* Office Hours Times */}
          <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
            <WeeklyCalendar isClassTimes={false} />
          </div>

          {/* Meeting Location and Recording Link */}
          <div>
            <MeetingLocation functionPassed={handleInputChange}/>
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

