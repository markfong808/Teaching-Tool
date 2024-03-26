/* ProgramDetails.js
 * Last Edited: 3/24/24
 *
 * Programs tab for Instructor account_type.
 * Instructor can choose if they're creating, updating, or deleting
 * programs, availability, description,
 * meeting duration, location, and virtual meeting links
 * for a course or globally that applies to all courses.
 *
 * Known Bugs:
 * -
 *
 */

import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext.js";
import { getCookie } from "../utils/GetCookie.js";
import { Tooltip } from "../components/Tooltip.js";
import WeeklyCalendar from "../components/WeeklyCalendar.js";
import ChooseAppointmentDatesPopup from "../components/ChooseAppointmentDatesPopup.js";
import ProgramLocation from "../components/ProgramLocation.js";
import CreateProgramPopup from "../components/CreateProgramPopup.js";
import CreateAppointmentBlock from "../components/CreateAppointmentBlock.js";
import AutoAcceptAppointments from "../components/AutoAcceptAppointments.js";
import CreateCoursePopup from "../components/CreateCoursePopup.js";
import CourseDetails from "../components/CourseDetails.js";

export default function ProgramDetails() {
  // General Variables
  const csrfToken = getCookie("csrf_access_token");
  const { user } = useContext(UserContext);

  // Load Variables
  const [initialLoad, setInitialLoad] = useState(true);
  const [loadProgramTable, setLoadProgramTable] = useState(true);
  const [postTimes, setPostTimes] = useState(false);
  const [isCourseSelected, setIsCourseSelected] = useState(true);
  const [isProgramSelected, setIsProgramSelected] = useState(false);
  const [locationChecker, setLocationChecker] = useState(false);
  const [isAllCoursesSelected, setIsAllCoursesSelected] = useState(true);
  const [isDropinsLayout, setIsDropinsLayout] = useState(true);
  const [isRangedBasedLayout, setIsRangedBasedLayout] = useState(true);
  const [newProgramId, setNewProgramId] = useState();
  const [isCourseDetails, setIsCourseDetails] = useState(false);

  // Popup Load Variables
  const [boxShown, setBoxShown] = useState(false);
  const [
    isChooseAppointmentDatesPopUpVisible,
    setChooseAppointmentDatesPopUpVisible,
  ] = useState(false);
  const [isCreateAvailabilityPopUpVisible, setCreateAvailabilityPopUpVisible] =
    useState(false);
  const [isCreateCoursePopup, setCreateCoursePopup] = useState(false);
  const [isCreateProgramPopup, setCreateProgramPopup] = useState(false);
  const [showDuration, setShowDuration] = useState(false);

  // Course Data Variables
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [allCourseData, setAllCourseData] = useState([]);
  const [selectedCourseData, setSelectedCourseData] = useState({
    id: "",
    course_name: "",
    programs: [],
  });
  const [selectedProgramData, setSelectedProgramData] = useState({});

  // Times Data Variables
  const [allProgramTimesInCourse, setAllProgramTimesInCourse] = useState({});

  ////////////////////////////////////////////////////////
  //               Fetch Get Functions                  //
  ////////////////////////////////////////////////////////

  // fetch all courses the instructor is associated with
  const fetchAllInstructorCourses = async () => {
    if (user.account_type !== "instructor") return;

    try {
      const response = await fetch(`/instructor/programs`, {
        credentials: "include",
      });

      const fetchedCourses = await response.json();

      setAllCourseData(fetchedCourses);
    } catch (error) {
      console.error("Error fetching all instructor courses:", error);
    }
  };

  // fetch all times the courseId is associated with
  const fetchTimesData = async (courseId) => {
    if (courseId === -1) {
      return;
    }

    try {
      const response = await fetch(
        `/course/programs/times/${encodeURIComponent(courseId)}`,
        {
          credentials: "include",
        }
      );

      const fetchedCourseTimes = await response.json();

      if (fetchedCourseTimes !== null) {
        // create a tempData object and loop through fetchedCourseTimes
        const tempData = fetchedCourseTimes
          .filter((item) => item.name !== "Course Details") // filter out fetchedCoursesTimes by "Course Details" name
          .reduce((acc, item) => {
            const programId = item.program_id;

            // check if the programId exists in the accumulator object,
            // if it doesn't, initialize accumulator as an empty object with programId
            if (!acc[programId]) {
              acc[programId] = {};
            }

            // add start_time and end_time to the accumulator object based on the program id and day
            acc[programId][item.day] = {
              start_time: item.start_time,
              end_time: item.end_time,
            };

            return acc;
          }, {});

        // set allTimesData to tempData
        setAllProgramTimesInCourse(tempData);
      } else {
        setAllProgramTimesInCourse({});
      }
    } catch (error) {
      console.error("Error fetching time info:", error);
    }
  };

  ////////////////////////////////////////////////////////
  //               Fetch Post Functions                 //
  ////////////////////////////////////////////////////////

  // posts updated program data for a course to the ProgramDetails table
  const postProgramToDatabase = async () => {
    try {
      // Set default values for max_daily_meetings, max_weekly_meetings, and max_monthly_meetings if they are empty or null
      if (
        selectedProgramData.max_daily_meetings === "" ||
        selectedProgramData.max_daily_meetings === null
      ) {
        selectedProgramData.max_daily_meetings = 999;
      }

      if (
        selectedProgramData.max_weekly_meetings === "" ||
        selectedProgramData.max_weekly_meetings === null
      ) {
        selectedProgramData.max_weekly_meetings = 999;
      }

      if (
        selectedProgramData.max_monthly_meetings === "" ||
        selectedProgramData.max_monthly_meetings === null
      ) {
        selectedProgramData.max_monthly_meetings = 999;
      }

      await fetch(`/program/details`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify({
          data: selectedProgramData,
          course_id: selectedCourseId,
        }),
      });

      fetchAllInstructorCourses();
    } catch (error) {
      console.error("Error saving program details:", error);
    }
  };

  // handleSaveChanges helper: update ProgramTimes table in database for attached course
  // called in a UseEffect below
  const postProgramTimes = async () => {
    try {
      console.log(allProgramTimesInCourse);
      await fetch(
        `/course/programs/times/${encodeURIComponent(selectedProgramData.id)}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": csrfToken,
          },
          body: JSON.stringify(allProgramTimesInCourse),
        }
      );
    } catch (error) {
      console.error("Error saving course details:", error);
    }
  };

  // posts deletion of program to the ProgramDetails table
  const handleDeleteProgram = async () => {
    if (window.confirm("Are your sure you want to delete this program?")) {
      try {
        const response = await fetch(`/program/delete/${selectedProgramId}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "X-CSRF-TOKEN": csrfToken,
          },
        });

        if (response.ok) {
          // If the cancellation was successful, update the state to reflect that
          alert("Program deleted successfully!");
          // reload webpage details (like program switch)
          await handleCourseChange({ target: { value: selectedCourseId } });
          handleProgramChange({ target: { value: -1 } });
        } else {
          throw new Error("Failed to delete program");
        }
      } catch (error) {
        console.error("Error deleting program:", error);
      }
    }
  };

  ////////////////////////////////////////////////////////
  //                  Handler Functions                 //
  ////////////////////////////////////////////////////////

  // called when instructor clicks to change selected course
  const handleCourseChange = async (e) => {
    if (!e) {
      return;
    }

    const selectedCourse =
      e.target.value === null ? null : parseInt(e.target.value);

    // reload courseIds with all courses
    await fetchAllInstructorCourses();

    // change selectedCourseId
    setSelectedCourseId(selectedCourse);

    // update course info displayed on page to selectedCourseId
    updateCourseInfo(selectedCourse);

    // reset program information
    setSelectedProgramId(-1);
    updateProgramInfo(-1);

    // update timesData to selectedCourse
    fetchTimesData(selectedCourse);
  };

  // called when the instructor changes the program
  const handleProgramChange = (e) => {
    if (!e) {
      return;
    }

    const selectedProgram =
      e.target.value === null ? null : parseInt(e.target.value);

    if (selectedProgram === -2) {
      setIsCourseDetails(true);
    } else {
      setIsCourseDetails(false);
    }

    // change selectedProgramid to selectedProgram
    setSelectedProgramId(selectedProgram);

    // update programinfo displayed on page to selectedProgram
    updateProgramInfo(selectedProgram);

    // reload program times table
    setLoadProgramTable(true);
  };

  // update the selectedCourseData based on a courseId
  const updateCourseInfo = async (courseId) => {
    if (courseId === -1) {
      setSelectedCourseData({
        id: "",
        course_name: "",
        programs: [],
      });
      return;
    }

    const selectedCourse = allCourseData.find(
      (course) => course.id === courseId
    );

    if (selectedCourse) {
      // Update selectedCourseData with selectedCourse.id
      setSelectedCourseData(selectedCourse);
    } else {
      setSelectedCourseData({
        id: "",
        course_name: "",
        programs: [],
      });
    }
  };

  // update the selectedProgramData based on a programId
  const updateProgramInfo = (programId) => {
    if (!programId || programId === -1) {
      setSelectedProgramData({});

      setBoxShown(false);
      return;
    }

    const selectedCourse = allCourseData.find(
      (course) => course.id === selectedCourseId
    );

    const selectedProgram = selectedCourse.programs.find(
      (program) => program.id === programId
    );

    if (selectedProgram) {
      // Update selectedProgramData with selectedProgram.id
      if (!selectedProgram.duration) {
        selectedProgram.duration = "";
      }

      // Update if a course details program has been selected
      /*if (selectedProgram.name === "Course Details") {
        setIsCourseDetails(true);
      } else {
        setIsCourseDetails(false);
      }*/

      setSelectedProgramData(selectedProgram);

      if (!selectedProgram.duration || selectedProgram.duration === "") {
        setBoxShown(false);
      }
    }
  };

  // update courseData with instructor input
  const handleInputChange = (e) => {
    if (!e || (e.target.name === "duration" && e.target.value.includes("a"))) {
      return;
    }

    // if name is duration check the duration provided by instructor
    if (e.target.name === "duration") {
      if (Number(e.target.value) > 0) {
        let maxRecommendedDuration = 1440;

        // iterate through allProgramTimesInCourse[selectedProgramId]
        for (const data of Object.entries(
          allProgramTimesInCourse[selectedProgramId]
        )) {
          const startDate = new Date(`1970-01-01T${data[1].start_time}`);
          const endDate = new Date(`1970-01-01T${data[1].end_time}`);

          // calculate timeDifference into minutes
          const timeDifference = endDate - startDate;
          const minutes = Math.floor(timeDifference / (1000 * 60));

          // if maxsplit larger than minutes, set maxsplit to minutes
          if (minutes < maxRecommendedDuration) {
            maxRecommendedDuration = minutes;
          }
        }

        // inform instructor that Duration is too long
        if (e.target.value > maxRecommendedDuration) {
          setTimeout(() => {
            window.alert("Duration value is too large. Lower your duration");
          }, 10);
        }
      }
    }

    let newValue = e.target.value;

    // Handle the radio button specifically
    if (e.target.type === "radio") {
      newValue = e.target.value === "true"; // Convert the value to boolean
    }

    setSelectedProgramData({
      ...selectedProgramData,
      [e.target.name]: newValue,
    });
  };

  // update timesData based on instructor entries
  const handleTimesChange = (e) => {
    if (!e) {
      return;
    }

    const tempDay = e.name;
    const tempValue = e.value;

    // Create a new times data object to store the allProgramTimesInCourse[selectedProgramId]
    let updatedTimesData = { ...allProgramTimesInCourse[selectedProgramId] };

    // Check if the day already exists in allProgramTimesInCourse[selectedProgramId]
    if (tempValue.length === 0) {
      // If e.value.length == 0, delete the day from allProgramTimesInCourse[selectedProgramId]
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

    setAllProgramTimesInCourse({
      ...allProgramTimesInCourse,
      [selectedProgramId]: updatedTimesData,
    });

    setPostTimes(true);
  };

  // saves all course details to database
  const handleSaveChanges = async () => {
    if (Object.entries(selectedProgramData).length > 0) {
      if (
        selectedProgramData.name === "" ||
        selectedProgramData.name === "Course Details" ||
        !selectedProgramData.name
      ) {
        alert("Program Name must be changed.");
        return;
      }

      postProgramToDatabase();
    }
  };

  // reload webpage data and select new program
  const loadNewProgram = (programId) => {
    setNewProgramId(programId);
    fetchAllInstructorCourses();
  };

  // updates setBoxShown when instructor clicks on checkbox
  const showBox = () => {
    if (boxShown) {
      handleInputChange({ target: { name: "duration", value: "" } });
      setBoxShown(false);
    } else {
      setBoxShown(true);
    }
  };

  // based on what tab selected, handle course details accordingly
  const tabSelect = (boolean) => {
    setIsAllCoursesSelected(boolean);
    if (boolean) {
      handleCourseChange({ target: { value: null } }); // -1 associated with all course programs having global type
    } else {
      handleCourseChange({ target: { value: -1 } }); // no global type with single course
    }
    handleProgramChange({ target: { value: -1 } });
  };

  ////////////////////////////////////////////////////////
  //               UseEffects Functions                 //
  ////////////////////////////////////////////////////////

  // on initial page load, select default tab
  useEffect(() => {
    if (!initialLoad) {
      tabSelect(true);
    }
    setInitialLoad(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoad, user]);

  // post to database once changes save
  useEffect(() => {
    if (postTimes) {
      postProgramTimes();
      setPostTimes(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postTimes]);

  // reload the child info when SelectedProgramTimesData updates
  useEffect(() => {
    setLoadProgramTable(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProgramTimesInCourse]);

  // update courseInfo when selectedCourseId is updated
  useEffect(() => {
    const fetchDataAndUpdate = async () => {
      if (selectedCourseId !== -1) {
        await updateCourseInfo(selectedCourseId);

        if (newProgramId) {
          handleProgramChange({ target: { value: newProgramId } });
          setNewProgramId();
        }

        setIsCourseSelected(true);
      } else {
        setIsCourseSelected(false);
      }
    };

    // call async function
    fetchDataAndUpdate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId, allCourseData]);

  // update isProgramSelected when selectedProgramId is updated
  useEffect(() => {
    if (selectedProgramId && selectedProgramId !== -1) {
      setIsProgramSelected(true); // if, programid valid set to true
    } else {
      setIsProgramSelected(false);
    }
  }, [selectedProgramId]);

  // - update boxShown if duration is greater than 0
  // - update setIsDropinsLayout when selectedProgramData updates
  // - update setLocationChecker when selectedProgramData physical location or virtual link is
  useEffect(() => {
    // check if duration is greater than 0 to show the box
    const isDurationValid = Number(selectedProgramData.duration) > 0;
    setBoxShown(isDurationValid);

    // check and set isDropinsLayout
    const isDropinsLayoutValid =
      selectedProgramData.isDropins !== "" && !selectedProgramData.isDropins;
    setIsDropinsLayout(!isDropinsLayoutValid);

    // check and set isRangedBasedLayout
    const isRangedBasedLayoutValid =
      selectedProgramData.isRangeBased !== "" &&
      !selectedProgramData.isRangeBased;
    setIsRangedBasedLayout(!isRangedBasedLayoutValid);

    // check if physical_location or meeting_url is valid and set locationChecker
    const isLocationValid =
      (selectedProgramData.physical_location &&
        selectedProgramData.physical_location !== "") ||
      (selectedProgramData.meeting_url &&
        selectedProgramData.meeting_url !== "");
    setLocationChecker(isLocationValid);
  }, [
    selectedProgramData.duration,
    selectedProgramData.isDropins,
    selectedProgramData.isRangeBased,
    selectedProgramData.physical_location,
    selectedProgramData.meeting_url,
  ]);

  // post a null duration to database when duration box is unchecked
  useEffect(() => {
    if (!boxShown && selectedProgramId) {
      handleSaveChanges();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boxShown]);

  useEffect(() => {
    console.log(allCourseData);
  }, [allCourseData]);

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  if (!user) {
    return <div>Loading user data...</div>;
  }

  // HTML for webpage
  return (
    <div>
      <div className="flex flex-col m-auto">
        <div className="flex w-full cursor-pointer justify-center">
          <div
            className={`w-1/2 text-center text-white text-lg font-bold p-1 border-2 hover:border-green ${
              isAllCoursesSelected
                ? "bg-gold border-gold"
                : "bg-metallic-gold border-metallic-gold"
            }`}
            onClick={() => {
              if (!isAllCoursesSelected) {
                tabSelect(true);
              }
            }}
          >
            All Course Programs
          </div>
          <div
            className={`w-1/2 text-center text-white text-lg font-bold p-1 border-2 ${
              isAllCoursesSelected
                ? "bg-metallic-gold border-metallic-gold hover:border-green"
                : "bg-gold border-gold hover:border-green"
            }`}
            onClick={() => {
              if (isAllCoursesSelected) {
                tabSelect(false);
              }
            }}
          >
            Single Course Programs
          </div>
        </div>

        <div className="w-3/4 p-5 m-auto">
          <div className="flex justify-between">
            <div className="ml-10">
              {!isAllCoursesSelected && (
                <div
                  className={`flex ${
                    !isCourseSelected
                      ? "animate-blink flex border-4 border-white p-4 rounded-3xl"
                      : "p-5"
                  }`}
                >
                  <h1>
                    <strong>Course:</strong>
                  </h1>
                  <select
                    className="border border-light-gray rounded ml-2 hover:bg-gray hover:cursor-pointer"
                    id="course-dropdown"
                    value={selectedCourseId}
                    onChange={(e) => handleCourseChange(e)}
                  >
                    <option className="bg-white" key={-1} value={-1}>
                      Select...
                    </option>
                    {allCourseData.map(
                      (course) =>
                        course.id && (
                          <option
                            className="bg-white"
                            key={course.id}
                            value={course.id}
                          >
                            {course.course_name}
                          </option>
                        )
                    )}
                  </select>
                  <button
                    className={`font-bold border border-light-gray rounded-md shadow-md text-sm px-1 py-1 ml-4 hover:bg-gray`}
                    onClick={() => setCreateCoursePopup(!isCreateCoursePopup)}
                  >
                    Create Course
                  </button>
                </div>
              )}
            </div>

            <div
              className={`flex items-center mr-10 ${
                isCourseSelected && !isProgramSelected
                  ? "animate-blink border-4 border-white p-4 rounded-3xl"
                  : "p-5"
              }`}
            >
              <h1>
                <strong>Program:</strong>
              </h1>
              <select
                className="border border-light-gray rounded ml-2 hover:bg-gray hover:cursor-pointer"
                id="course-dropdown"
                value={selectedProgramId}
                onChange={(e) => handleProgramChange(e)}
                disabled={!isCourseSelected}
              >
                <option className="bg-white" key="" value="">
                  Select...
                </option>
                {!isAllCoursesSelected && (
                  <option className="bg-white" key={-2} value={-2}>
                    Course Details
                  </option>
                )}
                {selectedCourseData.programs.map((program) => (
                  <option
                    className="bg-white"
                    key={program.id}
                    value={program.id}
                  >
                    {program.name}
                  </option>
                ))}
              </select>
              <button
                className={`font-bold border border-light-gray rounded-md shadow-md text-sm px-1 py-1 ml-4 hover:bg-gray ${
                  !isCourseSelected ? "opacity-50" : ""
                }`}
                onClick={() => setCreateProgramPopup(!isCreateProgramPopup)}
                disabled={!isCourseSelected}
              >
                Create Program
              </button>
              <Tooltip
                text={`For Office Hours programs, please use the title "Office Hours". To view your Courses' details, select the "Course Details" program.`}
                flip={true}
              >
                <span>ⓘ</span>
              </Tooltip>
            </div>
          </div>
        </div>

        {isCourseSelected ? (
          <>
            {isProgramSelected ? (
              <>
                {isCourseDetails ? (
                  <CourseDetails courseId={selectedCourseId} />
                ) : (
                  <>
                    <div className="flex justify-center items-center">
                      <button
                        className="w-12% font-bold border border-light-gray bg-gray rounded-md shadow-md px-1 py-1 mb-2 mr-1"
                        disabled
                      >
                        {isDropinsLayout ? "Drop-Ins" : "Appointment Based"}
                      </button>
                      <button
                        className="w-12% font-bold border border-light-gray bg-gray rounded-md shadow-md px-1 py-1 mb-2 ml-1"
                        disabled
                      >
                        {isRangedBasedLayout ? "Range Based" : "Specific Dates"}
                      </button>
                    </div>

                    <div className="flex flex-col w-3/4 px-5 m-auto">
                      <div className="py-5 border border-light-gray rounded-md shadow-md">
                        <div className="relative">
                          <button
                            className={`font-bold border border-light-gray rounded-md shadow-md text-sm px-3 py-3 absolute inset-y-10 left-0 flex justify-center items-center ml-6 hover:bg-gray z-10`}
                          >
                            Auto Generate Details
                          </button>
                          <button
                            className={`font-bold border border-light-gray rounded-md shadow-md text-sm px-3 py-3 absolute inset-y-10 right-0 flex justify-center items-center mr-6 hover:bg-gray z-10`}
                            onClick={handleDeleteProgram}
                          >
                            Delete Program
                          </button>
                        </div>

                        <div className="pb-10 flex justify-center relative">
                          <input
                            className="text-center font-bold text-2xl px-2"
                            style={{
                              width: `${
                                selectedProgramData.name
                                  ? selectedProgramData.name.length * 18
                                  : ""
                              }px`,
                            }}
                            name="name"
                            value={selectedProgramData.name}
                            onChange={handleInputChange}
                            onBlur={handleSaveChanges}
                          />
                          <Tooltip
                            text="Click Program Name To Change Value."
                            position="top"
                          >
                            <span className="absolute transform">ⓘ</span>
                          </Tooltip>
                        </div>

                        <div className="flex flex-col">
                          <div className="w-3/4 m-auto">
                            <div className="flex flex-col p-5 border border-light-gray rounded-md shadow-md mt-5">
                              <div>
                                <label className="font-bold">
                                  Program Description &nbsp;
                                </label>
                                <Tooltip text="Description of the program related to meetings for a course.">
                                  <span>ⓘ</span>
                                </Tooltip>
                              </div>
                              <textarea
                                className="border border-light-gray mt-3 hover:bg-gray"
                                name="description"
                                value={selectedProgramData.description || ""}
                                onChange={(event) => handleInputChange(event)}
                                onBlur={handleSaveChanges}
                              />
                            </div>

                            <ProgramLocation
                              isCourseInfoProgram={false}
                              functions={{
                                inputChangeFunction: handleInputChange,
                                saveChangeFunction: handleSaveChanges,
                              }}
                              data={selectedProgramData}
                            />

                            {!isDropinsLayout && (
                              <AutoAcceptAppointments
                                functions={{
                                  setSelectedProgramData:
                                    setSelectedProgramData,
                                  handleInputChange: handleInputChange,
                                  saveChangeFunction: handleSaveChanges,
                                }}
                                userInstance={user}
                                data={selectedProgramData}
                              />
                            )}

                            {!locationChecker ? (
                              <div className="flex flex-row p-5 m-auto mt-5 justify-center">
                                <label className="font-bold text-xl">
                                  *Enter A Location And/Or Virtual Meeting Link
                                  To Create Times*
                                </label>
                              </div>
                            ) : (
                              !isRangedBasedLayout && (
                                <button
                                  className="flex flex-row p-5 m-auto mt-5 justify-center font-bold border border-light-gray rounded-md shadow-md text-xl px-5 py-3 hover:bg-gray"
                                  onClick={() =>
                                    setCreateAvailabilityPopUpVisible(
                                      !isCreateAvailabilityPopUpVisible
                                    )
                                  }
                                >
                                  Create Appointment Block
                                </button>
                              )
                            )}

                            {locationChecker === true &&
                              (isRangedBasedLayout ? (
                                <>
                                  <div className="flex-1 flex-col p-5 border border-light-gray rounded-md shadow-md mt-5">
                                    <WeeklyCalendar
                                      functions={{
                                        timesChangeFunction: handleTimesChange,
                                        loadPageFunction: setLoadProgramTable,
                                        setShowDuration: setShowDuration,
                                        saveChangeFunction: handleSaveChanges,
                                      }}
                                      times={
                                        allProgramTimesInCourse[
                                          selectedProgramId
                                        ]
                                      }
                                      loadPage={loadProgramTable}
                                      program_id={selectedProgramData.id}
                                    />
                                  </div>
                                  {showDuration && (
                                    <div className="flex flex-row items-center mt-4 p-5 border border-light-gray rounded-md shadow-md mt-5">
                                      <label className="whitespace-nowrap font-bold text-2xl">
                                        Define Appointment Duration?
                                      </label>
                                      <input
                                        type="checkbox"
                                        class="form-checkbox h-6 w-7 text-blue-600 ml-2 mt-1 hover:cursor-pointer"
                                        checked={boxShown}
                                        onChange={showBox}
                                      ></input>

                                      {boxShown && (
                                        <div className="flex items-end">
                                          <input
                                            className="border border-light-gray ml-3 mt-1 w-20 hover:bg-gray"
                                            name="duration"
                                            value={selectedProgramData.duration}
                                            onChange={(event) => {
                                              const inputValue =
                                                event.target.value;
                                              const numericValue =
                                                inputValue.replace(
                                                  /[^0-9]/g, // Remove non-numeric characters
                                                  "a"
                                                );
                                              handleInputChange({
                                                target: {
                                                  name: "duration",
                                                  value: numericValue,
                                                },
                                              });
                                            }}
                                            onBlur={handleSaveChanges}
                                          />
                                          <label className="whitespace-nowrap font-bold text-sm ml-1">
                                            minutes
                                          </label>
                                        </div>
                                      )}
                                      <button
                                        className={`ms-auto font-bold border border-light-gray rounded-md shadow-md text-sm px-2 py-2 hover:bg-gray`}
                                        onClick={() =>
                                          setChooseAppointmentDatesPopUpVisible(
                                            !isChooseAppointmentDatesPopUpVisible
                                          )
                                        }
                                      >
                                        Choose Appointment Dates
                                      </button>
                                    </div>
                                  )}
                                </>
                              ) : (
                                isCreateAvailabilityPopUpVisible && (
                                  <div className="fixed inset-0 z-10">
                                    <CreateAppointmentBlock
                                      id={selectedCourseId}
                                      program_id={selectedProgramData.id}
                                      program_name={selectedProgramData.name}
                                      duration={selectedProgramData.duration}
                                      physical_location={
                                        selectedProgramData.physical_location
                                      }
                                      meeting_url={
                                        selectedProgramData.meeting_url
                                      }
                                      isDropins={selectedProgramData.isDropins}
                                      onClose={() =>
                                        setCreateAvailabilityPopUpVisible(false)
                                      }
                                    />
                                  </div>
                                )
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="m-auto mt-40 py-10 px-16 border border-light-gray rounded-3xl shadow-md">
                <label className="font-bold text-3xl">
                  Please Select A Program
                </label>
              </div>
            )}
          </>
        ) : (
          <div className="m-auto mt-40 py-10 px-16 border border-light-gray rounded-3xl shadow-md">
            <label className="font-bold text-3xl">Please Select A Course</label>
          </div>
        )}
      </div>

      {isChooseAppointmentDatesPopUpVisible && (
        <div className="fixed inset-0 z-10">
          <ChooseAppointmentDatesPopup
            onClose={() => setChooseAppointmentDatesPopUpVisible(false)}
            data={allProgramTimesInCourse[selectedProgramId]}
            id={selectedCourseId}
            duration={selectedProgramData.duration}
            physical_location={selectedProgramData.physical_location}
            meeting_url={selectedProgramData.meeting_url}
            program_id={selectedProgramId}
            program_name={selectedProgramData.name}
            isDropins={selectedProgramData.isDropins}
          />
        </div>
      )}

      {isCreateCoursePopup && (
        <div className="fixed inset-0 z-10">
          <CreateCoursePopup
            onClose={() => setCreateCoursePopup(false)}
            user_id={user.id}
            loadFunction={fetchAllInstructorCourses}
          />
        </div>
      )}

      {isCreateProgramPopup && (
        <div className="fixed inset-0 z-10">
          <CreateProgramPopup
            onClose={() => setCreateProgramPopup(false)}
            courseId={selectedCourseId}
            loadFunction={loadNewProgram}
          />
        </div>
      )}

      {/* Empty Space at bottom of webpage */}
      <div className="p-10"></div>
    </div>
  );
}
