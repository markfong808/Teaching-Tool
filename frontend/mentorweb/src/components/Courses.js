import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { capitalizeFirstLetter } from '../utils/FormatDatetime';
import { getCookie } from '../utils/GetCookie';
import { Tooltip } from './Tooltip';
import { ClassContext } from "../context/ClassContext.js";
import ScheduleMeetingPopup from './ScheduleMeetingPopup.js';
import MeetingInformation from './MeetingInformation.js';
import CourseInformationPopup from './CourseInformationPopup.js';

export default function Courses() {
  // General Variables
  const csrfToken = getCookie("csrf_access_token");
  const { user, setUser } = useContext(UserContext);
  const [isPopUpVisible, setPopUpVisible] = useState(false);
  const [isClassInformationPopupVisible, setClassInformationPopupVisible] = useState(false);

  // Load Variables
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Local Variables
  const [selectedCourseId, setSelectedCourseId] = useState('-1');
  const [allCourseData, setAllCourseData] = useState([]);
  const [instructorData, setInstructorData] = useState({
    id: "",
    email: "",
    title: "",
    last_name: "",
    pronouns: "",
  });

  // Class Data Variables
  const contextValue = useContext(ClassContext);
  const { classInstance } = contextValue || {};
  const [classData, setClassData] = useState({
    class_name: classInstance?.class_name || "",
    class_comment: classInstance?.class_comment || "",
    class_time: classInstance?.class_time || "",
    class_location: classInstance?.class_location || "",
    class_link: classInstance?.class_link || "",
    class_recordings_link: classInstance?.class_recordings_link || "",
    office_hours_time: classInstance?.office_hours_time || "",
    office_hours_location: classInstance?.office_hours_location || "",
    office_hours_link: classInstance?.office_hours_link || "",
    discord_link: classInstance?.discord_link || "",
    teacher_id: classInstance?.teacher_id || "",
  });



  ////////////////////////////////////////////////////////
  //               Fetch Data Functions                 //
  ////////////////////////////////////////////////////////

  // fetch all courses the student is associated with from database
  const fetchCourseList = async () => {
    
    if (user.account_type !== "student") return;

    
    try {
      const response = await fetch(`/student/courses`, {
        credentials: "include",
      });

      const fetchedCourseList = await response.json();

      // set courses a student is enrolled in with fetched data
      setAllCourseData(fetchedCourseList);

    } catch (error) {
      console.error("Error fetching course list:", error);
    }
  };

  // fetch instructor information from a user based on their ID
  const fetchInstructorInfo = async (teacherId) => {
    try {
      const response = await fetch(
        `/profile/instructor/${encodeURIComponent(teacherId)}`,
        {
          credentials: "include",
        }
      );

      const fetchedInstructorInfo = await response.json();

      // set instructor data with fetched data
      setInstructorData(fetchedInstructorInfo);
    } catch (error) {
      console.error("Error fetching course info:", error);
    }
  };



  ////////////////////////////////////////////////////////
  //                 Update Function                    //
  ////////////////////////////////////////////////////////

  // update the course information being displayed on the webpage
  const updateCourseInfo = (courseId) => {
    if (!courseId) {
      return;
    }

    const selectedCourse = allCourseData.find((course) => course.id === courseId);

    if (selectedCourse) {
      // update classData with selectedCourse
      setClassData(selectedCourse);

      // fetch instructor information from selected course
      fetchInstructorInfo(selectedCourse.teacher_id);
    } else {
      console.error("Selected course not found");
    }
  };



  ////////////////////////////////////////////////////////
  //               Local Data Function                  //
  ////////////////////////////////////////////////////////

  
  // called when student chooses a course from drop down menu
 // const handleCourseChange = (e) => {
  //  const selectedCourse = parseInt(e.target.value);
  //  setSelectedCourseId(selectedCourse);
  //  updateCourseInfo(selectedCourse);
  // };

  // called when a student clicks on one of the courses they're registered in
  const handleButtonClick = (course) => {
    setSelectedCourseId(course.id);
    updateCourseInfo(course.id);
    setClassInformationPopupVisible(true);
  };

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
  };

  
  ////////////////////////////////////////////////////////
  //               UseEffect Function                   //
  ////////////////////////////////////////////////////////

  useEffect(() => {
    if (!isPageLoaded) {
      fetchCourseList();
      setIsPageLoaded(!isPageLoaded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageLoaded, user]);

 
  // HTML for webpage
  // will change soon***
  return (
    <div>
      <div className="flex flex-col m-auto relative justify-center items-center">
        <div className="flex flex-row w-2/3 p-5 m-auto justify-center">
          {allCourseData.map((course) => (
            <button
              key={course.id} 
              className="m-2 p-2 border border-light-gray rounded-md shadow-md font-bold"
              onClick={() => handleButtonClick(course)}
            >
              {course.class_name}: Class Details
            </button>
          ))}
        </div>

        {isClassInformationPopupVisible && (
          <div className='absolute mt-40'>
            <CourseInformationPopup onClose={() => setClassInformationPopupVisible(false)} courseData={classData} instructorData={instructorData} />
          </div>
        )}

      

        {/*REDO CSS CODE HERE*/}
        <div className="p-2.5">
        </div>

        {/* Second Box */}
        <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md">
          <MeetingInformation />
        </div>

        <div className="flex flex-col w-1/6 p-2 m-auto border border-light-gray rounded-md shadow-md mt-5">
          <button className="bg-purple p-2 rounded-md text-white hover:text-gold" onClick={() => setPopUpVisible(!isPopUpVisible)}> Schedule New Meeting</button>
        </div>

      </div>
          
      {isPopUpVisible && (
          <ScheduleMeetingPopup onClose={() => setPopUpVisible(false)}/>
        )}
    </div>
  );
}