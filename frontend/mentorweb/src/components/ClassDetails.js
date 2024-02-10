import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { capitalizeFirstLetter } from '../utils/FormatDatetime';
import { getCookie } from '../utils/GetCookie';
import { Tooltip } from './Tooltip';
import WeeklyCalendar from './WeeklyCalendar';
import { ClassContext } from "../context/ClassContext.js";


export default function ClassDetails() {
  const { user, setUser } = useContext(UserContext);
  const [changesMade, setChangesMade] = useState(false);

  // From MeetingLocation File
  const [inPerson, setInPerson] = useState(false);
  const [boxShown, setBoxShown] = useState(false);
  const [location, setLocation] = useState(''); // location is never being set in this file
  const [meeting_url, setMeetingUrl] = useState(''); // meeting_url is never being set in this file

  // set class instance
  const contextValue = useContext(ClassContext);
  const { classInstance } = contextValue || {};
  const [classData, setClassData] = useState({
    info: classInstance?.class_comment || '',
    class_time: classInstance?.class_time || '',
    class_location: classInstance?.class_location || '',
    class_link: classInstance?.class_link || '',
    office_hours_time: classInstance?.office_hours_time || '',
    office_hours_location: classInstance?.office_hours_location || '',
    office_hours_link: classInstance?.office_hours_link || ''
  });

  useEffect(() => {
    // Update form data when user context updates
    if (user.account_type === "mentor") {
      setClassData({
        info: classInstance?.class_comment || '',
        class_time: classInstance?.class_time || '',
        class_location: classInstance?.class_location || '',
        class_link: classInstance?.class_link || '',
        office_hours_time: classInstance?.office_hours_time || '',
        office_hours_location: classInstance?.office_hours_location || '',
        office_hours_link: classInstance?.office_hours_link || ''
      });
    } 
  }, [user, classInstance]);

 const handleInputChange = (e) => {
    const {name, value} = e.target;
    let newValue = value;


    setClassData({ ...classData, [name]: newValue });

    // Check if changes were made
    const formIsSameAsClass = (
      (name === 'info' && value === classInstance.class_comment) ||
      (name === 'class_time' && value === classInstance.class_time) ||
      (name === 'class_location' && value === classInstance.class_location) ||
      (name === 'class_link' && value === classInstance.class_link) ||
      (name === 'office_hours_time' && value === classInstance.office_hours_time) ||
      (name === 'office_hours_location' && value === classInstance.office_hours_location) ||
      (name === 'office_hours_link' && value === classInstance.office_hours_link)
    );
    
    // Set changesMade to true if form data does not match initial class data
    setChangesMade(!formIsSameAsClass);
  };

  const handleCancelChanges = () => {
    // Reset form data to initial class data
    setClassData({
      info: classInstance.class_comment || '',
      class_time: classInstance.class_time || '',
      class_location: classInstance.class_location || '',
      class_link: classInstance.class_link || '',
      office_hours_time: classInstance.office_hours_time || '',
      office_hours_location: classInstance.office_hours_location || '',
      office_hours_link: classInstance.office_hours_link || '',
    });
    setChangesMade(false); // Reset changes made
  };

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
 // Meeting Location show box
  const showBox = () => {
    if (boxShown) {
      setBoxShown(false);
      //setInPerson(false);
    }
    else {
      setBoxShown(true);
      setInPerson(true);
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
            name="info"
            value={classData.info}
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
            {/* Set Class Location Box */}
            <div className="flex flex-col w-1/2 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
              <div className="flex items-center">
                <label className="font-bold text-2xl">Set Class Location:</label>
                <input type="checkbox" id="myCheckbox" class="form-checkbox h-5 w-5 text-blue-600 ml-5" onClick={showBox}></input>
                <span className="px-2 py-2 text-sm font-normal">In-Person?</span>
                {boxShown && (
                  <input
                    className='border border-light-gray ml-2 text-sm font-normal'
                    name='location'
                    value={location}
                    onChange={handleInputChange}
                  />
                )}
              </div>
            </div>

            {/* Meeting Location and Recording Link */}
            <div className="flex flex-col w-1/2 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
              <div className="flex items-center">
                <label className="font-bold text-2xl">Class Recording Link:</label>
                <input className='border border-light-gray ml-5 text-sm font-normal w-1/2'
                  name='meeting_url'
                  value={meeting_url}
                  onChange={handleInputChange}
                />
              </div>
            </div>
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

