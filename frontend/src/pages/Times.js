/* Times.js
 * Last Edited: 3/26/24
 *
 * Times tab for the Instructor account_type.
 * Allows instructor to manage availabilities for global and per course programs.
 * In addition, the instructor can see a table of Upcoming, Pending, and Past meetings and
 * update any meetings that are upcoming.
 *
 * Known Bugs:
 * -
 *
 */

import React, { useEffect, useState, useContext } from "react";
import AppointmentsTable from "../components/AppointmentsTable.js";
import ManageAvailabilityTable from "../components/ManageAvailabilityTable.js";
import { UserContext } from "../context/UserContext.js";
import { isnt_Instructor } from "../utils/CheckUser.js";

export default function Times() {
  // General Variables
  const { user } = useContext(UserContext);

  // Load Variables
  const [initialLoad, setInitialLoad] = useState(true);

  // Course Data Variables
  const [selectedCourseId, setSelectedCourseId] = useState(-1);
  const [allCoursesData, setAllCoursesData] = useState([]);

  ////////////////////////////////////////////////////////
  //               Fetch Get Functions                  //
  ////////////////////////////////////////////////////////

  // fetch all courses the instructor is associated with
  const fetchAllInstructorCourses = async () => {
    // user isn't an instructor
    if (isnt_Instructor(user)) return;

    try {
      const response = await fetch(`/user/courses`, {
        credentials: "include",
      });

      const fetchedCourses = await response.json();

      // setAllCoursesData to the instructor's fetched courses
      setAllCoursesData(fetchedCourses);
    } catch (error) {
      console.error("Error fetching instructor courses:", error);
    }
  };

  ////////////////////////////////////////////////////////
  //                 Handler Functions                  //
  ////////////////////////////////////////////////////////

  // called when instructor clicks to change selected course
  const handleCourseChange = (e) => {
    if (!e) {
      return;
    }

    const selectedCourse = parseInt(e.target.value);

    // setSelectedCourseId to selectedCourse
    setSelectedCourseId(selectedCourse);
  };

  ////////////////////////////////////////////////////////
  //               UseEffect Functions                  //
  ////////////////////////////////////////////////////////

  // on initial page load, fetchAllInstructorCourses()
  useEffect(() => {
    if (!initialLoad) {
      fetchAllInstructorCourses();
    }
    setInitialLoad(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoad, user]);

  ////////////////////////////////////////////////////////
  //               Render Functions                     //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  return (
    // Container for Times webpage
    <div className="flex flex-col m-auto mt-8">
      {/* Course selection when an instructor wants to see Availabilities for all Courses */}
      <div className="w-3/4 p-5 m-auto items-center">
        {/* Course header */}
        <h1 className="inline-block">
          {" "}
          <strong>Course:</strong>
        </h1>

        {/* Course Selection */}
        <select
          className="border border-light-gray rounded ml-2 hover:cursor-pointer"
          value={selectedCourseId}
          onChange={(e) => handleCourseChange(e)}
        >
          <option key={-1} value="-1">
            All Courses
          </option>
          {allCoursesData.map((course) => (
            <option key={course.id} value={course.id}>
              {course.course_name}
            </option>
          ))}
        </select>
      </div>

      {/* ManageAvaiblity Table so an instructor can see their Availabilities and manage them */}
      <div className="flex flex-col w-3/4 p-5 m-auto border border-light-gray rounded-md shadow-md">
        <ManageAvailabilityTable courseId={selectedCourseId} />
      </div>

      {/* Appointments Table so a student can see Appointments they booked */}
      <div className="flex flex-col w-3/4 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
        <AppointmentsTable courseId={selectedCourseId} reloadTable={false} />
      </div>

      {/* Empty Space at bottom of webpage */}
      <div className="p-10"></div>
    </div>
  );
}
