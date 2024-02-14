import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { capitalizeFirstLetter } from '../utils/FormatDatetime';
import { getCookie } from '../utils/GetCookie';
import { Tooltip } from './Tooltip';
import WeeklyCalendar from './WeeklyCalendar';
import { ClassContext } from "../context/ClassContext.js";
import { TimesContext } from "../context/TimesContext.js";
import MeetingLocation from './MeetingLocation.js';


export default function ClassDetails() {
  // global
  const csrfToken = getCookie('csrf_access_token');
  const { user, setUser } = useContext(UserContext);
  const [changesMade, setChangesMade] = useState(false);
  const [courseIds, setCourseIds] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // class variables
  const contextValue = useContext(ClassContext);
  const { classInstance } = contextValue || {};
  const [classData, setClassData] = useState({
    id: classInstance?.id || '',
    class_comment: classInstance?.class_comment || '',
    class_time: classInstance?.class_time || '',
    class_location: classInstance?.class_location || '',
    class_link: classInstance?.class_link || '',
    class_recordings_link: classInstance?.class_recordings_link || '',
    office_hours_time: classInstance?.office_hours_time || '',
    office_hours_location: classInstance?.office_hours_location || '',
    office_hours_link: classInstance?.office_hours_link || ''
  });

  const timesContextValue = useContext(TimesContext);
  const { timesInstance } = timesContextValue || {};
  const [timesData, setTimesData] = useState([]);

  const [instructorData, setInstructorData] = useState({
    id: '',
    email: '',
    title: '',
    last_name: '',
    pronouns: '',
  });

  useEffect(() => {
    // Update form data when user context updates
    if (user.account_type === "mentor") {
      setClassData({
        id: classInstance?.id || '',
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
    setChangesMade(true);
  };

  const handleTimesChange = (e) => {
    const tempType = e.type;
    const tempDay = e.name;
    const tempValue = e.value;
    console.log(tempDay);
    console.log(tempValue[0]);

    setTimesData((prevTimesData) => [
      ...prevTimesData,
      {
        type: tempType,
        day: tempDay,
        start_time: tempValue[0],
        end_time: tempValue[1],
      },
    ]);
  };

  useEffect(() => {
    if (!isPageLoaded) {
      fetchCourseList();
      setIsPageLoaded(!isPageLoaded);
    }
    console.log(classData);
    console.log(timesData);
    console.log(courseIds);
  }, [isPageLoaded, classData, timesData, courseIds]);

  // handle to cancel webpage changes when user is done editing details
  const handleCancelChanges = () => {
    // Reset form data to initial class data
    setClassData({
      id: classInstance.id || '',
      class_comment: classInstance.class_comment || '',
      class_time: classInstance.class_time || '',
      class_location: classInstance.class_location || '',
      class_link: classInstance.class_link || '',
      class_recordings_link: classInstance.class_recordings_link || '',
      office_hours_time: classInstance.office_hours_time || '',
      office_hours_location: classInstance.office_hours_location || '',
      office_hours_link: classInstance.office_hours_link || '',
    });

    setTimesData([{
      day: timesInstance.day || '',
      start_time: timesInstance.start_time || '',
      end_time: timesInstance.end_time || '',
    }]);
    setChangesMade(false); // Reset changes made
  };

  // handle to save webpage changes when user is done editing details
  const handleSaveChanges = async () => {
    const timeEndpoint = `/course/setTime`
    const classEndpoint = `/course/setClassDetails`
    callSetTime(timeEndpoint);
    callSetTime(classEndpoint);
  };

  // handleSaveChanges helper to update ClassTimes table in database
  const callSetTime = async (endpoint) => {
    const payload = {
      ...timesData,
      id: classInstance.id,
    };
    console.log(payload);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Profile update failed');
      }

      setChangesMade(false); // Reset changes made

      // Update the times context with the new data
      const updatedTimes = await response.json();
      setTimesData((currentTimes) => ({ ...currentTimes, ...updatedTimes }));
    } catch (error) {
      console.error('Error updating time profile:', error);
    }

  };

  // handleSaveChanges helper to update ClassInformation table in database
  const callSetClassDetails = async (endpoint) => {
    try {
      const response = await fetch(endpoint, {
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

      // Update the class context with the new data
      const updatedData = await response.json();
      setClassData((currentData) => ({ ...currentData, ...updatedData }));
    } catch (error) {
      console.error('Error updating class profile:', error);
    }

  };

  // fetch all courses the student is associated with from database
  const fetchCourseList = async () => {
    if (user.account_type !== "mentor") return;

    try {
      const response = await fetch(`/student/courses`, {
        credentials: 'include',
      });

      const fetchedCourseList = await response.json();

      setCourseIds(fetchedCourseList);
    } catch (error) {
      console.error("Error fetching course list:", error);
    }
  };

  // update the course information being displayed on the webpage
  const updateCourseInfo = (courseId) => {
    if (!courseId) {
      return;
    }

    const selectedCourse = courseIds.find(course => course.id === courseId);

    if (selectedCourse) {
      // Update classData with selectedCourse
      setClassData(selectedCourse);

      // fetch instructor information from selected course
      fetchInstructorInfo(selectedCourse.teacher_id);
    } else {
      console.error("Selected course not found");
    }
  };

  // fetch instructor information from a user based on their ID
  const fetchInstructorInfo = async (teacherId) => {
    try {
      const response = await fetch(`/profile/instructor/${encodeURIComponent(teacherId)}`, {
        credentials: 'include',
      });

      const fetchedInstructorInfo = await response.json();

      // set instructor data with fetched data
      setInstructorData(fetchedInstructorInfo);
    } catch (error) {
      console.error("Error fetching course info:", error);
    }
  };

  const handleCourseChange = (e) => {
    const selectedCourse = parseInt(e.target.value);
    setSelectedCourseId(selectedCourse);
    updateCourseInfo(selectedCourse);
  };

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="flex flex-col w-7/8 m-auto">
      <div className="flex flex-col w-2/3 p-5 m-auto">
        <div id="dropdown">
          <h1 className='inline-block'><strong>Select Course:</strong></h1>
          <select
            className='border border-light-gray rounded ml-2'
            id="course-dropdown"
            value={selectedCourseId}
            onChange={(e) => handleCourseChange(e)}
          >
            <option value="">Select...</option>
            {courseIds.map((course) => (
              <option key={course.id} value={course.id}>{course.class_name}</option>
            ))}
          </select>
        </div>
      </div>

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
            onChange={(event) => handleInputChange(event.target)}
          />


          {/* Class Times */}
          <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
            <WeeklyCalendar isClassTimes={true} param={{ functionPassed: handleTimesChange }} />
          </div>

          {/* Office Hours Times */}
          <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
            <WeeklyCalendar isClassTimes={false} param={{ functionPassed: handleTimesChange }} />
          </div>

          {/* Class Location and Recording Link */}
          <div>
            <MeetingLocation isClassLocation={true} param={{ functionpassed: handleInputChange }} />
          </div>
          {/* Office Hours Location and Link */}
          <div>
            <MeetingLocation isClassLocation={false} param={{ functionpassed: handleInputChange }} />
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

