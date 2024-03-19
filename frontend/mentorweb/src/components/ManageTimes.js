/* ManageTimes.js
 * Last Edited: 3/11/24
 *
 * Manage Times tab for the Instructor role.
 * Allows teacher to see availibility table and
 * Manage Availability for global and per class program types.
 * In addition, the Teacher can see a table of Upcoming, Pending, and Past meetings and
 * cancel any meetings that are upcoming.
 *
 * Known Bugs:
 * -
 *
 */

import React, { useEffect, useState, useContext } from "react";
import MeetingInformation from "./MeetingInformation.js";
import ManageAvailability from "./ManageAvailability.js";
import { UserContext } from "../context/UserContext";

export default function ManageTimes() {
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
    if (user.account_type !== "mentor") return;

    try {
      const response = await fetch(`/student/courses`, {
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
      <div className="flex flex-col w-3/4 p-5 m-auto border border-light-gray rounded-md shadow-md">
        <ManageAvailability courseId={selectedCourseId} />
      </div>
      <div className="flex flex-col w-3/4 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
        <MeetingInformation courseId={selectedCourseId} reloadTable={false} />
      </div>
      {/* Empty Space at bottom of webpage */}
      <div className="p-10"></div>
    </div>
  );
}
