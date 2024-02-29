import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { getCookie } from '../utils/GetCookie';
import ScheduleMeetingPopup from './ScheduleMeetingPopup.js';
import MeetingInformation from './MeetingInformation.js';
import CourseInformationPopup from './CourseInformationPopup.js';
import DropinsTable from './DropinsTable.js';

export default function Courses() {
  // General Variables
  const csrfToken = getCookie("csrf_access_token");
  const { user, setUser } = useContext(UserContext);
  const [isPopUpVisible, setPopUpVisible] = useState(false);
  const [isClassInformationPopupVisible, setClassInformationPopupVisible] = useState(false);

  // Load Variables
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [reloadAppointmentsTable, setReloadAppointmentsTable] = useState(false);

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
  const [classData, setClassData] = useState({});



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
    }
  };



  ////////////////////////////////////////////////////////
  //               Local Data Function                  //
  ////////////////////////////////////////////////////////

  // called when a student clicks on one of the courses they're registered in
  const handleButtonClick = (course) => {
    updateCourseInfo(course.id);
    setTimeout(() => {
      setClassInformationPopupVisible(true);
    }, 10);
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

  const reloadAppointments = () => {
    setReloadAppointmentsTable(true);
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

        <div className='w-2/3'>
            <h1>
              <strong>Select Course:</strong>
            </h1>
            <select
              className="border border-light-gray rounded ml-2"
              id="course-dropdown"
              value={selectedCourseId}
              onChange={(e) => handleCourseChange(e)}
            >
              <option key={-1} value="-1">
                All Courses
              </option>
              {allCourseData.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.class_name}
                </option>
              ))}
            </select>
          </div>

        <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
          <DropinsTable courseId={selectedCourseId}/>
        </div>

        <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
          <MeetingInformation courseId={selectedCourseId} reloadTable={reloadAppointmentsTable} param={ { resetLoad: setReloadAppointmentsTable } }/>
        </div>

        <div className="flex flex-col w-1/6 p-2 m-auto border border-light-gray rounded-md shadow-md mt-5">
          <button className="bg-purple p-2 rounded-md text-white hover:text-gold" onClick={() => setPopUpVisible(!isPopUpVisible)}> Schedule New Meeting</button>
        </div>

        
      </div>

      {isClassInformationPopupVisible && (
          <div className='fixed inset-0'>
            <CourseInformationPopup onClose={() => setClassInformationPopupVisible(false)} courseData={classData} instructorData={instructorData} />
          </div>
        )}
          
      {isPopUpVisible && (
        <div className='fixed inset-0'>
          <ScheduleMeetingPopup onClose={() => setPopUpVisible(false)} param={ { reloadAppointments: reloadAppointments } }/>
        </div>
      )}
      {/* Empty Space at bottom of webpage */}
      <div className="p-10"></div>
    </div>
  );
}