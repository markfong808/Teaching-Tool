/* ManageTimes.js
 * Last Edited: 3/24/24
 *
 * Manage Times tab for the Instructor account_type.
 * Allows instructor to see availibility table and
 * Manage Availability for global and per course programs.
 * In addition, the instructor can see a table of Upcoming, Pending, and Past meetings and
 * cancel any meetings that are upcoming.
 *
 * Known Bugs:
 * -
 *
 */

import React, { useEffect, useState, useContext } from "react";
import AppointmentsTable from "../components/AppointmentsTable.js";
import ManageAvailabilityTable from "../components/ManageAvailabilityTable.js";
import { UserContext } from "../context/UserContext.js";

export default function Times() {
  // General Variables
  const { user } = useContext(UserContext);

  // Load Variables
  const [initialLoad, setInitialLoad] = useState(true);

  // Course Data Variables
  const [selectedCourseId, setSelectedCourseId] = useState(-1);
  const [allCourseData, setAllCourseData] = useState([]);

  ////////////////////////////////////////////////////////
  //               Fetch Get Functions                  //
  ////////////////////////////////////////////////////////

  // fetch all courses the instructor is associated with
  const fetchAllInstructorCourses = async () => {
    if (user.account_type !== "instructor") return;

    try {
      const response = await fetch(`/user/courses`, {
        credentials: "include",
      });

      const fetchedCourses = await response.json();

      // set all the course data to the instructor's fetched courses
      setAllCourseData(fetchedCourses);
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

    // set selectedCourseId to the selectedCourse from instructor option choice
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
    <div className="flex flex-col m-auto mt-8">
      <div className="w-3/4 p-5 m-auto items-center">
        <h1 className="inline-block">
          {" "}
          <strong>Course:</strong>
        </h1>
        <select
          className="border border-light-gray rounded ml-2 hover:cursor-pointer"
          id="course-dropdown"
          value={selectedCourseId}
          onChange={(e) => handleCourseChange(e)}
        >
          <option key={-1} value="-1">
            All Courses
          </option>
          {allCourseData.map((course) => (
            <option key={course.id} value={course.id}>
              {course.course_name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col w-3/4 p-5 m-auto border border-light-gray rounded-md shadow-md">
        <ManageAvailabilityTable courseId={selectedCourseId} />
      </div>
      <div className="flex flex-col w-3/4 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
        <AppointmentsTable courseId={selectedCourseId} reloadTable={false} />
      </div>
      {/* Empty Space at bottom of webpage */}
      <div className="p-10"></div>
    </div>
  );
}
