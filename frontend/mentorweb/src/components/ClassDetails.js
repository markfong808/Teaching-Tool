import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { getCookie } from '../utils/GetCookie';
import { Tooltip } from './Tooltip';
import { ClassContext } from "../context/ClassContext.js";
import MeetingLocation from './MeetingLocation.js';
import MeetingInformation from './MeetingInformation.js'

export default function ClassDetails() {
  // General Variables
  const csrfToken = getCookie('csrf_access_token');
  const { user } = useContext(UserContext);
  const [changesMade, setChangesMade] = useState(false);

  // Load Variables
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [loadClassLocRec, setClassLocRec] = useState(false);
  const [loadOfficeHoursLocRec, setOfficeHoursLocRec] = useState(false);

  // Class Data Variables
  const contextValue = useContext(ClassContext);
  const { classInstance } = contextValue || {};
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [allCourseData, setAllCourseData] = useState([]);
  const [selectedClassData, setSelectedClassData] = useState({
    id: classInstance?.id || '',
    class_comment: classInstance?.class_comment || '',
    class_location: classInstance?.class_location || '',
    class_link: classInstance?.class_link || '',
    class_recordings_link: classInstance?.class_recordings_link || '',
    office_hours_location: classInstance?.office_hours_location || '',
    office_hours_link: classInstance?.office_hours_link || '',
    discord_link: classInstance?.discord_link || ''
  });






  ////////////////////////////////////////////////////////
  //               Fetch Data Functions                 //
  ////////////////////////////////////////////////////////

  // fetch from database: all courses the user is associated with
  const fetchCourseList = async () => {
    if (user.account_type !== "mentor") return;
  
    try {
      const response = await fetch(`/student/courses`, {
        credentials: 'include',
      });
  
      const fetchedCourseList = await response.json();
  
      setAllCourseData(fetchedCourseList);
    } catch (error) {
      console.error("Error fetching course list:", error);
    }
  };



  ////////////////////////////////////////////////////////
  //               Post Data Functions                  //
  ////////////////////////////////////////////////////////

  // called when user clicks save changes button
  // saves all class and times details to database
  const handleSaveChanges = async () => {
    if (selectedClassData) {
      postClassDetailsToDatabase();  // class mode
    }
  };

  // handleSaveChanges helper: update ClassTimes or 
  // ClassInformation table in database for attached course
  const postClassDetailsToDatabase = async () => {
    try {
      await fetch(`/course/setClassDetails`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(selectedClassData),
      });

      setChangesMade(false); // Hide Save/Cancel Buttons
    } catch (error) {
      console.error('Error saving class details:', error);
    }
  };

  // called when user creates a new course with a typed name
  // will be archived when merged to teaching tools***
  const handleCreateCourse = async () => {
    try {
      const payload = {
        class_name: courseName, 
        user_id: user.id, 
        role: user.account_type
      };

      await fetch(`/course/add-course`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(payload),
      });

      setIsPageLoaded(false);  // flag to reload page to add new course to dropdown selector
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };



  ////////////////////////////////////////////////////////
  //                  Load Functions                    //
  ////////////////////////////////////////////////////////

  // main webpage load function
  // called when user clicks to change selected course
  const handleCourseChange = (e) => {
    if (!e) {
      return;
    }

    // reload courseIds with all courses
    fetchCourseList();

    const selectedCourse = parseInt(e.target.value);

    // change selectedCourseId
    setSelectedCourseId(selectedCourse);

    // update course info displayed on page to selectedCourseId
    updateCourseInfo(selectedCourse);

    // flag to child objects to reload their information
    // with times data or selectedClassData
    reloadChildInfo();
  };

  // update the selectedClassData based on a courseId
  const updateCourseInfo = (courseId) => {
    if (!courseId) {
      setSelectedClassData({});
      return;
    }

    const selectedCourse = allCourseData.find(course => course.id === courseId);

    if (selectedCourse) {
      // Update selectedClassData with selectedCourse
      setSelectedClassData(selectedCourse);
    } else {
      console.error("Selected course not found");
    }
  };

  // called when information on the webpage needs to be reloaded
  // will flag to child objects to reload their information
  const reloadChildInfo = () => {
    setClassLocRec(!loadClassLocRec);
    setOfficeHoursLocRec(!loadOfficeHoursLocRec);
  };



  ////////////////////////////////////////////////////////
  //               Local Data Functions                 //
  ////////////////////////////////////////////////////////

  // update classData with user input
  const handleInputChange = (e) => {
    if (!e) {
      return;
    }

    setSelectedClassData({ ...selectedClassData, [e.name]: e.value });
    setChangesMade(true);
  };

  // handle to cancel webpage changes when user is done editing details
  // needs to be implemented
  const handleCancelChanges = () => {
    // Reset form data to initial meeting data
    updateCourseInfo(selectedClassData.id);
    setChangesMade(false); // Reset changes made
  };



  ////////////////////////////////////////////////////////
  //               UseEffects Functions                 //
  ////////////////////////////////////////////////////////

  useEffect(() => {
    if (!isPageLoaded) {
      fetchCourseList();
      setIsPageLoaded(!isPageLoaded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageLoaded, user]);

  useEffect(() => {
    // console.log(selectedClassData);
    // console.log(allCourseData);
  }, [selectedClassData, allCourseData]);

  if (!user) {
    return <div>Loading user data...</div>;
  }

  // HTML for webpage
  return (
    <div className="flex flex-col m-auto">
      <div className="w-3/4 p-5 m-auto">
        <div className='flex items-center'>
          <h1><strong>Select Course:</strong></h1>
          <select
            className='border border-light-gray rounded ml-2'
            id="course-dropdown"
            value={selectedCourseId}
            onChange={(e) => handleCourseChange(e)}
          >
            <option key={-1} value="">Select...</option>
            {allCourseData.map((course) => (
              <option key={course.id} value={course.id}>{course.class_name}</option>
            ))}
          </select>
          <button className="font-bold border border-light-gray rounded-md shadow-md text-sm px-1 py-1 ml-4" onClick={handleCreateCourse}>Create Course</button>
          <input className='border border-light-gray ml-2' value={courseName} onChange={(e) => setCourseName(e.target.value)}/>
        </div>
      </div>

      <div className="flex flex-col w-3/4 p-5 m-auto border border-light-gray rounded-md shadow-md">
        <div className="relative">
          <button className="font-bold border border-light-gray rounded-md shadow-md text-sm px-3 py-3 absolute inset-y-10 right-0 flex justify-center items-center mr-6">Auto Generate Details</button>
        </div>
        <h2 className='pb-10 text-center font-bold text-2xl'>Class Details</h2>

        <div className="flex flex-col">
          <div className='w-3/4 m-auto'>
            <div className="flex flex-col p-5 border border-light-gray rounded-md shadow-md mt-5">
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

              <textarea className='border border-light-gray mt-3'
                name="class_comment"
                value={selectedClassData.class_comment ?? ''}
                onChange={(event) => handleInputChange(event.target)}
              />
            </div>

            {/* Class Location and Recording Link */}
            <div>
              <MeetingLocation isClassLocation={true} param={{ functionPassed: handleInputChange, loadPageFunction: setClassLocRec, changesMade: setChangesMade }} data={{ class_location: selectedClassData.class_location, class_recordings_link: selectedClassData.class_recordings_link, class_link: selectedClassData.class_link }} loadPage={loadClassLocRec} changes={changesMade}/>
            </div>
            
            {/* Office Hours Location and Link */}
            <div>
              <MeetingLocation isClassLocation={false} param={{ functionPassed: handleInputChange, loadPageFunction: setOfficeHoursLocRec, changesMade: setChangesMade }} data={{ office_hours_location: selectedClassData.office_hours_location, office_hours_link: selectedClassData.office_hours_link }} loadPage={loadOfficeHoursLocRec} changes={changesMade}/>
            </div>

            <div className="w-2/3 m-auto">
              <div className="flex flex-col p-5 border border-light-gray rounded-md shadow-md mt-5">
                <div className="flex">
                  <label className="whitespace-nowrap font-bold text-2xl mb-2">Set Discord Link:</label>
                </div>
                  <div className="flex flex-row ">
                    <label className="whitespace-nowrap">Discord Link:</label>
                    <input className='border border-light-gray ml-2 w-40'
                      name= "discord_link"
                      value={selectedClassData.discord_link ?? ''}
                      onChange={(event) => handleInputChange(event.target)}
                    />
                  </div>
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