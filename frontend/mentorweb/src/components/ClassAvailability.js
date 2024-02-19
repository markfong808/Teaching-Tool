import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext.js';
import { getCookie } from '../utils/GetCookie.js';
import { Tooltip } from './Tooltip.js';
import WeeklyCalendar from './WeeklyCalendar.js';
import { ClassContext } from "../context/ClassContext.js";
import ChooseMeetingDatesPopup from './ChooseMeetingDatesPopup.js';


export default function ClassAvailability() {
  // General Variables
  const csrfToken = getCookie('csrf_access_token');
  const { user } = useContext(UserContext);
  const [changesMade, setChangesMade] = useState(false);
  const [boxShown, setBoxShown] = useState(false);
  const [isPopUpVisible, setPopUpVisible] = useState(false);

  // Load Variables
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [loadClassTimesTable, setClassTimesTable] = useState(false);
  const [loadOfficeHoursTable, setOfficeHoursTable] = useState(false);

  // Class Data Variables
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [allCourseData, setAllCourseData] = useState([]);
  const [selectedClassData, setSelectedClassData] = useState({
    class_id: '',
    type: 'office_hours',  // not used yet?
    timeSplit: '',
  });

  // Times Data Variables
  const [allTimesData, setAllTimesData] = useState([]);
  const [classTimesData, setClassTimesData] = useState([]);
  const [officeHoursTimesData, setOfficeHoursTimesData] = useState([]);






  ////////////////////////////////////////////////////////
  //               Fetch Data Functions                 //
  ////////////////////////////////////////////////////////

  // fetch from database: all courses the user is associated with
  // can make a new backend function to only get courseIds
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

  // fetch from database: all times the a courseId is associated with
  const fetchTimesData = async (courseId) => {
    if (!courseId) {
      return;
    }

    try {
      const response = await fetch(`/course/times/${encodeURIComponent(courseId)}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'FetchTimesData failed');
      }

      const fetchedCourseTimes = await response.json();

      // set instructor data with fetched data
      if (fetchedCourseTimes !== null) {
        setAllTimesData(fetchedCourseTimes);

        const tempClassTimesData = fetchedCourseTimes
        .filter(item => item.type === 'class_times')
        .reduce((acc, item) => {
          acc[item.day] = {
            start_time: item.start_time,
            end_time: item.end_time
          };
          return acc;
        }, {});

        const tempOfficeHoursData = fetchedCourseTimes
          .filter(item => item.type === 'office_hours')
          .reduce((acc, item) => {
            acc[item.day] = {
              start_time: item.start_time,
              end_time: item.end_time
            };
            return acc;
          }, {});

          setClassTimesData(tempClassTimesData);
          setOfficeHoursTimesData(tempOfficeHoursData);
      } else {
        const tempClassTimesData = []
        const tempOfficeHoursData = []

        setClassTimesData(tempClassTimesData);
        setOfficeHoursTimesData(tempOfficeHoursData);
      }
    } catch (error) {
      console.error("Error fetching course info:", error);
    }
  };



  ////////////////////////////////////////////////////////
  //               Post Data Functions                  //
  ////////////////////////////////////////////////////////

  // called when user clicks save changes button
  // saves all class and times details to database
  const handleSaveChanges = async () => {
    if (allTimesData) {
      postClassDetailsToDatabase();  // times mode
    }
  };

  // handleSaveChanges helper: update ClassTimes or 
  // ClassInformation table in database for attached course
  const postClassDetailsToDatabase = async () => {
    try {
      await fetch(`/course/setTime/${encodeURIComponent(selectedClassData.class_id)}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(allTimesData),
      });

      setChangesMade(false); // Hide Save/Cancel Buttons
    } catch (error) {
      console.error('Error saving class details:', error);
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

    // update timesData to selectedCourseId
    fetchTimesData(selectedCourse);

    // flag to child objects to reload their information
    // with times data or selectedClassData
    reloadChildInfo();
  };

  // update the selectedClassData based on a courseId
  const updateCourseInfo = (courseId) => {
    if (!courseId) {
      return;
    }

    const selectedCourse = allCourseData.find(course => course.id === courseId);

    if (selectedCourse) {
      // Update selectedClassData with selectedCourse.id
      setSelectedClassData({ ...selectedClassData, class_id: selectedCourse.id });
    } else {
      console.error("Selected course not found");
    }
  };

  // called when information on the webpage needs to be reloaded
  // will flag to child objects to reload their information
  const reloadChildInfo = () => {
    setClassTimesTable(!loadClassTimesTable);
    setOfficeHoursTable(!loadOfficeHoursTable);
  };



  ////////////////////////////////////////////////////////
  //               Local Data Functions                 //
  ////////////////////////////////////////////////////////

  // update classData with user input
  const handleInputChange = (e) => {
    if (!e) {
      return;
    }

    if (e.target.name === 'timeSplit') {
      let maxRecommendedTimeSplit = 1440;

      console.log(officeHoursTimesData);
      for (const data of Object.entries(officeHoursTimesData)) {
        const startDate = new Date(`1970-01-01T${data[1].start_time}`);
        const endDate = new Date(`1970-01-01T${data[1].end_time}`);
    
        const timeDifference = endDate - startDate;
        const minutes = Math.floor(timeDifference / (1000 * 60));
        if (minutes < maxRecommendedTimeSplit) {
          maxRecommendedTimeSplit = minutes;
        }
      }

      if (e.target.value > maxRecommendedTimeSplit) {
        setTimeout(() => {
          window.alert("Time Split value is too large. Lower your time split");
        }, 10);
      }
    }

    setSelectedClassData({ ...selectedClassData, [e.target.name]: e.target.value });
    setChangesMade(true);
  };

  // update timesData based on user entries
  const handleTimesChange = (e) => {
    if (!e) {
      return;
    }

    const tempType = e.type;
    const tempDay = e.name;
    const tempValue = e.value;

    // to remove a time block
    if (tempValue.length === 0) {
      setAllTimesData((prevTimesData) => {
        // Remove entries with matching tempDay and tempType
        const updatedTimesData = prevTimesData.filter(entry => !(entry.day === tempDay && entry.type === tempType));
        return updatedTimesData;
      });
    } 
    // to add a time block
    else {
      setAllTimesData((prevTimesData) => {
        // Check if an entry with the same day already exists
        const existingEntryIndex = prevTimesData.findIndex((entry) => entry.day === tempDay);

        if (existingEntryIndex !== -1) {
            // If the entry already exists, replace it
            const updatedTimesData = [...prevTimesData];
            updatedTimesData[existingEntryIndex] = {
                type: tempType,
                day: tempDay,
                start_time: tempValue[0],
                end_time: tempValue[1],
            };
            return updatedTimesData;
        } else {
            // If the entry doesn't exist, add a new entry
            return [
                ...(Array.isArray(prevTimesData) ? prevTimesData : []),
                {
                    type: tempType,
                    day: tempDay,
                    start_time: tempValue[0],
                    end_time: tempValue[1],
                },
            ];
        }
      });
    }
  };

  // handle to cancel webpage changes when user is done editing details
  // needs to be implemented
  const handleCancelChanges = () => {
    
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
    // console.log(allTimesData);
    // console.log(allCourseData);
  }, [selectedClassData, allTimesData, allCourseData]);

  useEffect(() => {
    // console.log(selectedClassData);
  }, [selectedClassData]);

  if (!user) {
    return <div>Loading user data...</div>;
  }

  const showBox = () => {
    if (boxShown) {
      setSelectedClassData({ ...selectedClassData, timeSplit: '' });
      // need to make work with save/cancel changes button
      setBoxShown(false);
    } else {
      setBoxShown(true);
    }
  };

  // HTML for webpage
  return (
    <div className="flex flex-col m-auto">
      <div className="w-3/4 p-5 m-auto">
        <div className="flex items-center">
          <h1>
            <strong>Select Course:</strong>
          </h1>
          <select
            className="border border-light-gray rounded ml-2"
            id="course-dropdown"
            value={selectedCourseId}
            onChange={(e) => handleCourseChange(e)}
          >
            <option value="">Select...</option>
            {allCourseData.map((course) => (
              <option key={course.id} value={course.id}>
                {course.class_name}
              </option>
            ))}
          </select>
          <button className="ms-auto font-bold w-1/3 border border-light-gray rounded-md shadow-md">
            Configure with 3rd Party Calendars
          </button>
        </div>
      </div>

      <div className="flex flex-col w-3/4 p-5 m-auto border border-light-gray rounded-md shadow-md">
        <div className="relative">
          <button className="font-bold border border-light-gray rounded-md shadow-md text-sm px-3 py-3 absolute inset-y-10 right-0 flex justify-center items-center mr-6">
            Auto Generate Details
          </button>
        </div>
        <h2 className="pb-10 text-center font-bold text-2xl">
          Class Availability
        </h2>

        <div className="flex flex-col">
          <div className="w-3/4 m-auto">
            {/* Class Times */}
            <div className="flex flex-col p-5 border border-light-gray rounded-md shadow-md mt-5">
              <WeeklyCalendar
                isClassTimes={true}
                param={{
                  functionPassed: handleTimesChange,
                  loadPageFunction: setClassTimesTable,
                  changesMade: setChangesMade,
                }}
                times={classTimesData}
                loadPage={loadClassTimesTable}
                changes={changesMade}
              />
            </div>

            {/* Office Hours Times */}
            <div className="flex flex-row items-center relative">
              <div className="flex-1 flex-col p-5 border border-light-gray rounded-md shadow-md mt-5">
                <WeeklyCalendar
                  isClassTimes={false}
                  param={{
                    functionPassed: handleTimesChange,
                    loadPageFunction: setOfficeHoursTable,
                    changesMade: setChangesMade,
                  }}
                  times={officeHoursTimesData}
                  loadPage={loadOfficeHoursTable}
                />
              </div>
              <button className="font-bold border border-light-gray rounded-md shadow-md text-xs px-2 py-2 absolute -right-36 mt-4">
                Emergency Office<br></br> Hour Changes
              </button>
            </div>
              
              <div className="flex flex-row items-center mt-4">
                <label className="whitespace-nowrap font-bold text-2xl">Split Time Blocks?</label>
                <input type="checkbox" id="myCheckbox" class="form-checkbox h-6 w-7 text-blue-600 ml-2 mt-1" checked={boxShown} onChange={showBox}></input>
                {boxShown && (
                  <input className='border border-light-gray ml-2 mt-1'
                      name='timeSplit'
                      value={selectedClassData.timeSplit}
                      onChange={(event) => {
                        const inputValue = event.target.value;
                        const numericValue = inputValue.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                        handleInputChange({ target: { name: 'timeSplit', value: numericValue } });
                      }}
                  />
                )}
                <button className="ms-auto font-bold border border-light-gray rounded-md shadow-md text-sm px-2 py-2" onClick={() => setPopUpVisible(!isPopUpVisible)}>Choose Meeting Dates</button>
            </div>
          </div>

          {changesMade && (
            <div className="flex flex-row justify-end my-5">
              <button
                className="bg-purple text-white rounded-md p-2 mr-2 hover:text-gold"
                onClick={handleSaveChanges}
              >
                Save Class Changes
              </button>
              <button
                className="bg-purple text-white rounded-md p-2 hover:text-gold"
                onClick={handleCancelChanges}
              >
                Discard Class Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {isPopUpVisible && (
        <ChooseMeetingDatesPopup onClose={() => setPopUpVisible(false)} data={officeHoursTimesData} id={selectedCourseId} timeSplit={selectedClassData.timeSplit}/>
      )}
    </div>
  );
}