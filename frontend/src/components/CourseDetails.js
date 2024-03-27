/* CourseDetails.js
 * Last Edited: 3/26/24
 *
 * Contains the input fields for course details programs
 * which are displayed in CourseDetailsPopup.js accessed
 * by students
 *
 * Known bugs:
 * -
 *
 */

import { useContext, useEffect, useState } from "react";
import ProgramLocation from "./ProgramLocation";
import { Tooltip } from "./Tooltip";
import WeeklyCalendar from "./WeeklyCalendar";
import { getCookie } from "../utils/GetCookie";
import { UserContext } from "../context/UserContext";
import { isnt_Instructor } from "../utils/CheckUser";

export default function CourseDetails({ courseId }) {
  // General Variables
  const csrfToken = getCookie("csrf_access_token");
  const { user } = useContext(UserContext);

  // Load Variables
  const [load, setLoad] = useState(true);
  const [loadCourseTimesTable, setLoadCourseTimesTable] = useState(true);
  const [postTimes, setPostTimes] = useState(false);

  // Course Data
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courseData, setCourseData] = useState({});
  const [times, setTimes] = useState({});

  ////////////////////////////////////////////////////////
  //               Fetch Get Functions                  //
  ////////////////////////////////////////////////////////

  // fetch course data for selected course
  const fetchCourseDetails = async () => {
    // user isn't an instructor
    if (isnt_Instructor(user)) return;

    try {
      const response = await fetch(`/course/details/${selectedCourseId}`, {
        credentials: "include",
      });

      const fetchedCourse = await response.json();

      setCourseData(fetchedCourse);
    } catch (error) {
      console.error("Error fetching course details:", error);
    }
  };

  // fetch all times the courseId is associated with
  const fetchTimesData = async () => {
    // user isn't an instructor or no course is selected
    if (selectedCourseId === -1 || isnt_Instructor(user)) {
      return;
    }

    try {
      const response = await fetch(
        `/course/times/${encodeURIComponent(selectedCourseId)}`,
        {
          credentials: "include",
        }
      );

      const fetchedCourseTimes = await response.json();

      // course times found
      if (fetchedCourseTimes !== null) {
        // loop through fetchedCourseTimes
        const tempData = fetchedCourseTimes.reduce((acc, item) => {
          const courseId = item.course_id;

          // check if the courseId exists in the accumulator object,
          // if it doesn't, initialize accumulator as an empty object with courseId
          if (!acc[courseId]) {
            acc[courseId] = {};
          }

          // add start_time and end_time to the accumulator object based on the program id and day
          acc[courseId][item.day] = {
            start_time: item.start_time,
            end_time: item.end_time,
          };

          return acc;
        }, {});

        // set allTimesData to tempData
        setTimes(tempData);
      }
      // no course times found
      else {
        setTimes({});
      }
    } catch (error) {
      console.error("Error fetching times:", error);
    }
  };

  ////////////////////////////////////////////////////////
  //               Fetch Post Functions                 //
  ////////////////////////////////////////////////////////

  // posts updated program data for a course to the ProgramDetails table
  const postCourseDetails = async () => {
    // user isn't an instructor
    if (isnt_Instructor(user)) return;

    try {
      await fetch(`/course/details`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(courseData),
      });

      // re-fetch course details
      fetchCourseDetails();
    } catch (error) {
      console.error("Error saving program details:", error);
    }
  };

  // post the times for the course to CourseTimes Table
  const postCourseTimes = async () => {
    // user isn't an instructor
    if (isnt_Instructor(user)) return;

    try {
      await fetch(`/course/times/${encodeURIComponent(courseData.id)}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(times),
      });
    } catch (error) {
      console.error("Error saving course times:", error);
    }
  };

  ////////////////////////////////////////////////////////
  //                 Handler Functions                  //
  ////////////////////////////////////////////////////////

  // load Course Details and Course Times from database into local variables
  const loadData = async () => {
    fetchCourseDetails();
    fetchTimesData();
  };

  // update courseData with instructor input
  const handleInputChange = (e) => {
    setCourseData({
      ...courseData,
      [e.target.name]: e.target.value,
    });
  };

  // update timesData based on instructor entries
  const handleTimesChange = (e) => {
    if (!e) {
      return;
    }

    const tempDay = e.name;
    const tempValue = e.value;

    // set updatedTimesData initially to times for the selected course
    let updatedTimesData = { ...times[selectedCourseId] };

    // if no days in object
    if (tempValue.length === 0) {
      // delete the day
      if (updatedTimesData[tempDay]) {
        delete updatedTimesData[tempDay];
      }
    }
    // if days in object
    else {
      // override its values
      updatedTimesData = {
        ...updatedTimesData,
        [tempDay]: {
          start_time: tempValue[0],
          end_time: tempValue[1],
        },
      };
    }

    // setTimes
    setTimes({
      ...times,
      [selectedCourseId]: updatedTimesData,
    });

    // post the times to the CourseTimes Table
    setPostTimes(true);
  };

  // saves all course details to CourseDetails Table
  const handleSaveChanges = async () => {
    if (Object.entries(courseData).length > 0) {
      postCourseDetails();
    }
  };

  ////////////////////////////////////////////////////////
  //               UseEffect Functions                  //
  ////////////////////////////////////////////////////////

  // on initial page load, fetch course details and times
  useEffect(() => {
    if (!load) {
      loadData();
    }
    setLoad(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, user]);

  // reload the WeeklyCalendar data when times updates
  useEffect(() => {
    setLoadCourseTimesTable(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [times]);

  // post to times to CourseTimes Table when changes are made
  useEffect(() => {
    if (postTimes) {
      postCourseTimes();
      setPostTimes(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postTimes]);

  // setSelectedCourseId when courseId changes
  useEffect(() => {
    setSelectedCourseId(courseId);
  }, [courseId]);

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  return (
    <>
      {/* Define CourseDetails container size and positioning for display */}
      <div className="flex flex-col w-3/4 px-5 m-auto py-42">
        <div className="py-5 border border-light-gray rounded-md shadow-md">
          <div className="relative">
            {/* Auto-generate details button for Course */}
            <button
              className={`font-bold border border-light-gray rounded-md shadow-md text-sm px-3 py-3 absolute inset-y-10 left-0 flex justify-center items-center ml-6 hover:bg-gray z-10`}
            >
              Auto Generate Details
            </button>
          </div>

          {/* Display Course name and allow for it to change with input field */}
          <div className="pb-10 flex justify-center relative">
            <input
              className="text-center font-bold text-2xl px-2"
              style={{
                width: `${
                  courseData.name ? courseData.name.length * 18 : ""
                }px`,
              }}
              name="name"
              value={courseData.name}
              onChange={handleInputChange}
              onBlur={handleSaveChanges}
            />

            {/* Tooltip to help instructor change name of course if they want */}
            <Tooltip text="Click Course Name To Change Value." position="top">
              <span className="absolute transform">ⓘ</span>
            </Tooltip>
          </div>

          {/* Container for UI Course Comments box and below */}
          <div className="flex flex-col">
            <div className="w-3/4 m-auto">
              {/* Box encompassing Course Comments */}
              <div className="flex flex-col p-5 border border-light-gray rounded-md shadow-md mt-5">
                <div>
                  {/* Course Comments label and Tooltip to help instructors understand purpose */}
                  <label className="font-bold">Course Comments &nbsp;</label>
                  <Tooltip text="Description of the program related to meetings for a course.">
                    <span>ⓘ</span>
                  </Tooltip>
                </div>

                {/* Text area for instructor to enter in Comments about Course */}
                <textarea
                  className="border border-light-gray mt-3 hover:bg-gray"
                  name="comments"
                  value={courseData.comments || ""}
                  onChange={(event) => handleInputChange(event)}
                  onBlur={handleSaveChanges}
                />
              </div>

              {/* Call Program Location Component for instructors to enter location information and about Course */}
              <ProgramLocation
                isCourseInfoProgram={true}
                functions={{
                  inputChangeFunction: handleInputChange,
                  saveChangeFunction: handleSaveChanges,
                }}
                data={courseData}
              />

              {/* Call WeeklyCalendar component where instructors can enter Course Times */}
              <div className="flex-1 flex-col p-5 border border-light-gray rounded-md shadow-md mt-5">
                <WeeklyCalendar
                  functions={{
                    timesChangeFunction: handleTimesChange,
                    loadPageFunction: setLoadCourseTimesTable,
                    saveChangeFunction: handleSaveChanges,
                  }}
                  times={times[selectedCourseId]}
                  loadPage={loadCourseTimesTable}
                  program_id={courseData.id}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
