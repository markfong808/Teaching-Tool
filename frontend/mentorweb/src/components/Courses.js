/* Courses.js
 * Last Edited: 3/11/24
 *
 * Courses Tab for students's view of courses they're registered in,
 * details of each course, drop in times for all and specific courses,
 * upcoming, pending, and past appointments, as well as the option to
 * schedule new meetings
 *
 * Known Bugs:
 * -
 *
 */

import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import ScheduleMeetingPopup from "./ScheduleMeetingPopup.js";
import MeetingInformation from "./MeetingInformation.js";
import CourseInformationPopup from "./CourseInformationPopup.js";
import DropinsTable from "./DropinsTable.js";

export default function Courses() {
  // General Variables
  const { user } = useContext(UserContext);

  // Load Variables
  const [initialLoad, setInitialLoad] = useState(true);
  const [reloadAppointmentsTable, setReloadAppointmentsTable] = useState(false);
  const [isScheduleMeetingPopUpVisible, setScheduleMeetingPopUpVisible] =
    useState(false);
  const [isCourseInformationPopupVisible, setCourseInformationPopupVisible] =
    useState(false);

  // Course Data Variables
  const [selectedCourseId, setSelectedCourseId] = useState();
  const [allCourseData, setAllCourseData] = useState([]);
  const [courseData, setCourseData] = useState({});
  const [instructorData, setInstructorData] = useState({
    id: "",
    email: "",
    title: "",
    last_name: "",
    pronouns: "",
  });

  ////////////////////////////////////////////////////////
  //               Fetch Get Functions                  //
  ////////////////////////////////////////////////////////

  // fetch all courses the student is associated with from database
  const fetchAllStudentCourses = async () => {
    if (user.account_type !== "student") return;

    try {
      const response = await fetch(`/student/courses`, {
        credentials: "include",
      });

      const allCourses = await response.json();

      // set courses a student is enrolled in with fetched data
      setAllCourseData(allCourses);
    } catch (error) {
      console.error("Error fetching all student courses:", error);
    }
  };

  // fetch instructor information from a user based on their ID
  const fetchInstructorInformation = async (teacherId) => {
    try {
      const response = await fetch(
        `/profile/instructor/${encodeURIComponent(teacherId)}`,
        {
          credentials: "include",
        }
      );

      const fetchedInstructorInformation = await response.json();

      // set instructor data with fetched data
      setInstructorData(fetchedInstructorInformation);
    } catch (error) {
      console.error("Error fetching instructor information:", error);
    }
  };

  ////////////////////////////////////////////////////////
  //               Handler Functions                    //
  ////////////////////////////////////////////////////////

  // called when a student clicks on one of the courses they're registered in
  const handleButtonClick = (course) => {
    setCourseInformation(course.id);

    // QOL delay
    setTimeout(() => {
      setCourseInformationPopupVisible(true);
    }, 10);
  };

  // called when student clicks to change selected course
  const handleCourseChange = (e) => {
    if (!e) {
      return;
    }

    // change selectedCourseId
    setSelectedCourseId(parseInt(e.target.value));
  };

  // reload appointments table
  const reloadAppointments = () => {
    setReloadAppointmentsTable(true);
  };

  // update the course information being displayed on the webpage
  const setCourseInformation = (courseId) => {
    if (!courseId) {
      return;
    }

    const selectedCourse = allCourseData.find(
      (course) => course.id === courseId
    );

    if (selectedCourse) {
      // update courseData with selectedCourse
      setCourseData(selectedCourse);

      // fetch instructor information from selected course
      fetchInstructorInformation(selectedCourse.teacher_id);
    }
  };

  ////////////////////////////////////////////////////////
  //               UseEffect Function                   //
  ////////////////////////////////////////////////////////

  // on initial page load, fetchCourseList()
  useEffect(() => {
    if (!initialLoad) {
      fetchAllStudentCourses();
    }
    setInitialLoad(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoad, user]);

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

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
              {course.class_name}: Course Details
            </button>
          ))}
        </div>

        <div className="flex w-2/3">
          <h1>
            <strong>Course:</strong>
          </h1>
          <select
            className="border border-light-gray rounded ml-2"
            value={selectedCourseId}
            onChange={(e) => handleCourseChange(e)}
          >
            <option key={-1} value="">
              Select...
            </option>
            {allCourseData.map((course) => (
              <option key={course.id} value={course.id}>
                {course.class_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
          <DropinsTable courseId={selectedCourseId} />
        </div>

        <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
          <MeetingInformation
            courseId={selectedCourseId}
            reloadTable={reloadAppointmentsTable}
          />
        </div>

        <div className="flex flex-col w-1/6 p-2 m-auto border border-light-gray rounded-md shadow-md mt-5">
          <button
            className="bg-purple p-2 rounded-md text-white hover:text-gold"
            onClick={() =>
              setScheduleMeetingPopUpVisible(!isScheduleMeetingPopUpVisible)
            }
          >
            Schedule New Meeting
          </button>
        </div>
      </div>

      {isCourseInformationPopupVisible && (
        <div className="fixed inset-0">
          <CourseInformationPopup
            onClose={() => setCourseInformationPopupVisible(false)}
            courseData={courseData}
            instructorData={instructorData}
          />
        </div>
      )}

      {isScheduleMeetingPopUpVisible && (
        <div className="fixed inset-0">
          <ScheduleMeetingPopup
            onClose={() => setScheduleMeetingPopUpVisible(false)}
            functions={{ reloadAppointments: reloadAppointments }}
          />
        </div>
      )}
      {/* Empty Space at bottom of webpage */}
      <div className="p-10"></div>
    </div>
  );
}
