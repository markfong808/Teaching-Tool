/* CourseDetails.js
 * Last Edited: 3/25/24
 *
 * Contains the input fields for course details programs
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

export default function CourseDetails({ courseId }) {
  // General Variables
  const csrfToken = getCookie("csrf_access_token");
  const { user } = useContext(UserContext);

  // Load Variables
  const [load, setLoad] = useState(true);
  const [loadProgramTable, setLoadProgramTable] = useState(true);
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
    if (user.account_type !== "instructor") return;

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
    if (selectedCourseId === -1) {
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

      if (fetchedCourseTimes !== null) {
        // create a tempData object and loop through fetchedCourseTimes
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
        console.log(tempData);
        setTimes(tempData);
      } else {
        setTimes({});
      }
    } catch (error) {
      console.error("Error fetching time info:", error);
    }
  };

  ////////////////////////////////////////////////////////
  //               Fetch Post Functions                 //
  ////////////////////////////////////////////////////////

  // posts updated program data for a course to the ProgramDetails table
  const postCourseDetails = async () => {
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

      fetchCourseDetails();
    } catch (error) {
      console.error("Error saving program details:", error);
    }
  };

  // handleSaveChanges helper: update ProgramTimes table in database for attached course
  // called in a UseEffect below
  const postCourseTimes = async () => {
    try {
      console.log(times);
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

    // Create a new times data object to store the times
    let updatedTimesData = { ...times[selectedCourseId] };

    // Check if the day already exists in times
    if (tempValue.length === 0) {
      // If e.value.length == 0, delete the day from times
      if (updatedTimesData[tempDay]) {
        delete updatedTimesData[tempDay];
      }
    } else {
      // If the day exists, override its values; otherwise, create a new entry
      updatedTimesData = {
        ...updatedTimesData,
        [tempDay]: {
          start_time: tempValue[0],
          end_time: tempValue[1],
        },
      };
    }

    setTimes({
      ...times,
      [selectedCourseId]: updatedTimesData,
    });

    setPostTimes(true);
  };

  // saves all course details to database
  const handleSaveChanges = async () => {
    if (Object.entries(courseData).length > 0) {
      postCourseDetails();
    }
  };

  ////////////////////////////////////////////////////////
  //               UseEffect Functions                  //
  ////////////////////////////////////////////////////////

  // on initial page load, select default tab
  useEffect(() => {
    if (!load) {
      console.log("DWADAWD");
      loadData();
    }
    setLoad(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, user]);

  // reload the child info when SelectedProgramTimesData updates
  useEffect(() => {
    setLoadProgramTable(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [times]);

  // post to database once changes save
  useEffect(() => {
    if (postTimes) {
      postCourseTimes();
      setPostTimes(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postTimes]);

  useEffect(() => {
    setSelectedCourseId(courseId);
  }, [courseId]);

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  return (
    <>
      <div className="flex flex-col w-3/4 px-5 m-auto py-42">
        <div className="py-5 border border-light-gray rounded-md shadow-md">
          <div className="relative">
            <button
              className={`font-bold border border-light-gray rounded-md shadow-md text-sm px-3 py-3 absolute inset-y-10 left-0 flex justify-center items-center ml-6 hover:bg-gray z-10`}
            >
              Auto Generate Details
            </button>
          </div>

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
            <Tooltip text="Click Course Name To Change Value." position="top">
              <span className="absolute transform">ⓘ</span>
            </Tooltip>
          </div>

          <div className="flex flex-col">
            <div className="w-3/4 m-auto">
              <div className="flex flex-col p-5 border border-light-gray rounded-md shadow-md mt-5">
                <div>
                  <label className="font-bold">Course Comments &nbsp;</label>
                  <Tooltip text="Description of the program related to meetings for a course.">
                    <span>ⓘ</span>
                  </Tooltip>
                </div>
                <textarea
                  className="border border-light-gray mt-3 hover:bg-gray"
                  name="comments"
                  value={courseData.comments || ""}
                  onChange={(event) => handleInputChange(event)}
                  onBlur={handleSaveChanges}
                />
              </div>

              <ProgramLocation
                isCourseInfoProgram={true}
                functions={{
                  inputChangeFunction: handleInputChange,
                  saveChangeFunction: handleSaveChanges,
                }}
                data={courseData}
              />

              <div className="flex-1 flex-col p-5 border border-light-gray rounded-md shadow-md mt-5">
                <WeeklyCalendar
                  functions={{
                    timesChangeFunction: handleTimesChange,
                    loadPageFunction: setLoadProgramTable,
                    saveChangeFunction: handleSaveChanges,
                  }}
                  times={times[selectedCourseId]}
                  loadPage={loadProgramTable}
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
