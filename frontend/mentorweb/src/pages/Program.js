/* Program.js
 * Last Edited: 3/9/24
 *
 * Class Availability tab for Instructor Role.
 * Instructor can choose if they're creating, updating, or deleting
 * program types, availability, description,
 * meeting duration, location, and virtual meeting links
 * for a course or globally that applies to all courses.
 *
 * Known Bugs:
 * - ToolTip UI Box next to Create Program Type button needs adjusting
 * - Dont let Course Times be used as a name. dont let repeat names be true
 *
 */

import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext.js";
import { getCookie } from "../utils/GetCookie.js";
import { Tooltip } from "../components/Tooltip.js";
import WeeklyCalendar from "../components/WeeklyCalendar.js";
import ChooseMeetingDatesPopup from "../components/ChooseMeetingDatesPopup.js";
import MeetingLocation from "../components/MeetingLocation.js";
import CreateProgramTypePopup from "../components/CreateProgramTypePopup.js";
import CreateAvailability from "../components/CreateAvailability.js";
import AutoAcceptMeetings from "../components/AutoAcceptMeetings.js";

export default function Program() {
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

  // Popup Load Variables
  const [boxShown, setBoxShown] = useState(false);
  const [isChooseMeetingDatesPopUpVisible, setChooseMeetingDatesPopUpVisible] =
    useState(false);
  const [isCreateAvailabilityPopUpVisible, setCreateAvailabilityPopUpVisible] =
    useState(false);
  const [isCreateProgramTypePopup, setCreateProgramTypePopup] = useState(false);
  const [showDuration, setShowDuration] = useState(false);

  // Course Data Variables
  const [selectedCourseId, setSelectedCourseId] = useState();
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [allCourseData, setAllCourseData] = useState([]);
  const [selectedCourseData, setSelectedCourseData] = useState({
    id: "",
    course_name: "",
    programs: [],
  });
  const [selectedProgramData, setSelectedProgramData] = useState({
    id: "",
    type: "",
    description: "",
    duration: "",
    physical_location: "",
    virtual_link: "",
    auto_approve_appointments: true,
    max_daily_meetings: "",
    max_weekly_meetings: "",
    max_monthly_meetings: "",
    isDropins: "",
    isRangeBased: "",
  });

  // Times Data Variables
  const [allProgramTimesInCourse, setAllProgramTimesInCourse] = useState({});

  ////////////////////////////////////////////////////////
  //               Fetch Get Functions                  //
  ////////////////////////////////////////////////////////

  // fetch all courses the instructor is associated with
  const fetchAllInstructorCourses = async () => {
    if (user.account_type !== "mentor") return;

    try {
      const response = await fetch(`/mentor/courses`, {
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
    if (!courseId) {
      return;
    }

    try {
      const response = await fetch(
        `/course/times/${encodeURIComponent(courseId)}`,
        {
          credentials: "include",
        }
      );

      const fetchedCourseTimes = await response.json();

      if (fetchedCourseTimes !== null) {
        // create a tempData object and loop through fetchedCourseTimes
        const tempData = fetchedCourseTimes
          .filter((item) => item.type !== "Course Times") // filter out fetchedCoursesTimes by "course times" type
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

  // posts updated program data for a course to the ProgramType table
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

      await fetch(`/program/setDetails`, {
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
      console.error("Error saving program type details:", error);
    }
  };

  // handleSaveChanges helper: update ClassTimes table in database for attached course
  // called in a UseEffect below
  const postProgramTimes = async () => {
    try {
      await fetch(
        `/course/setTime/${encodeURIComponent(selectedCourseData.id)}`,
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

  // posts deletion of program to the ProgramType table
  const handleDeleteProgramType = async () => {
    if (window.confirm("Are your sure you want to delete this program type?")) {
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
          alert("Program Type deleted successfully!");
          // reload webpage details (like program switch)
          await fetchAllInstructorCourses();
          handleProgramChange({ target: { value: -1 } });
        } else {
          throw new Error("Failed to delete program type");
        }
      } catch (error) {
        console.error("Error deleting program type:", error);
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
    const newValue = e.target.value;

    // reload courseIds with all courses
    await fetchAllInstructorCourses();

    const selectedCourse = parseInt(newValue);

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

    let selectedProgram = parseInt(e.target.value);

    if (!selectedProgram) {
      selectedProgram = -1;
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
    if (!courseId) {
      setSelectedCourseData({});
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
      setSelectedProgramData({
        id: "",
        type: "",
        description: "",
        duration: "",
        physical_location: "",
        virtual_link: "",
        auto_approve_appointments: true,
        max_daily_meetings: "",
        max_weekly_meetings: "",
        max_monthly_meetings: "",
        isDropins: "",
        isRangeBased: "",
      });

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
        let maxRecommendedTimeSplit = 1440;

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
          if (minutes < maxRecommendedTimeSplit) {
            maxRecommendedTimeSplit = minutes;
          }
        }

        // inform instructor that timesplit is too long
        if (e.target.value > maxRecommendedTimeSplit) {
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
    if (selectedProgramData.type === "" || !selectedProgramData.type) {
      alert("Program Name cannot be empty.");
      return;
    }

    if (selectedProgramData) {
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
      handleCourseChange({ target: { value: -2 } }); // -2 associated with all course programs having global type
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
      if (selectedCourseId && selectedCourseId !== -1) {
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
    if (selectedProgramId !== "" && selectedProgramId !== -1) {
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

    // check if physical_location or virtual_link is valid and set locationChecker
    const isLocationValid =
      (selectedProgramData.physical_location &&
        selectedProgramData.physical_location !== "") ||
      (selectedProgramData.virtual_link &&
        selectedProgramData.virtual_link !== "");
    setLocationChecker(isLocationValid);
  }, [
    selectedProgramData.duration,
    selectedProgramData.isDropins,
    selectedProgramData.isRangeBased,
    selectedProgramData.physical_location,
    selectedProgramData.virtual_link,
  ]);

  // post a null duration to database when duration box is unchecked
  useEffect(() => {
    if (!boxShown && selectedProgramId && selectedProgramId !== -1) {
      handleSaveChanges();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boxShown]);

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
        <div className=" flex w-full cursor-pointer justify-center">
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
            className={`w-1/2 text-center text-white text-lg font-bold p-1 border-2 hover:border-green ${
              isAllCoursesSelected
                ? "bg-metallic-gold border-metallic-gold"
                : "bg-gold border-gold"
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
                    className="border border-light-gray rounded ml-2 hover:bg-gray"
                    id="course-dropdown"
                    value={selectedCourseId}
                    onChange={(e) => handleCourseChange(e)}
                  >
                    <option className="bg-white" key={-1} value="-1">
                      Select...
                    </option>
                    {allCourseData.map(
                      (course) =>
                        course.id !== -2 && (
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
                className="border border-light-gray rounded ml-2 hover:bg-gray"
                id="course-dropdown"
                value={selectedProgramId}
                onChange={(e) => handleProgramChange(e)}
                disabled={!isCourseSelected}
              >
                <option className="bg-white" key={-1} value="">
                  Select...
                </option>
                {selectedCourseData.programs.map((program) => (
                  <option
                    className="bg-white"
                    key={program.id}
                    value={program.id}
                  >
                    {program.type}
                  </option>
                ))}
              </select>
              <button
                className={`font-bold border border-light-gray rounded-md shadow-md text-sm px-1 py-1 ml-4 hover:bg-gray ${
                  !isCourseSelected ? "opacity-50" : ""
                }`}
                onClick={() =>
                  setCreateProgramTypePopup(!isCreateProgramTypePopup)
                }
                disabled={!isCourseSelected}
              >
                Create Program
              </button>
              <Tooltip
                text='For Course Times and Office Hours programs, please use the title "Course Times" or "Office Hours" respectively'
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
                      onClick={handleDeleteProgramType}
                    >
                      Delete Program
                    </button>
                  </div>

                  <div className="pb-10 flex justify-center relative">
                    <input
                      className="text-center font-bold text-2xl px-2"
                      style={{
                        width: `${selectedProgramData.type.length * 16}px`,
                      }}
                      name="type"
                      value={selectedProgramData.type}
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
                          <Tooltip text="Description of the program type related to meetings for a course.">
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

                      <MeetingLocation
                        isCourseInfoProgram={false}
                        functions={{
                          inputChangeFunction: handleInputChange,
                          saveChangeFunction: handleSaveChanges,
                        }}
                        data={{
                          physical_location:
                            selectedProgramData.physical_location,
                          virtual_link: selectedProgramData.virtual_link,
                        }}
                      />

                      {!isDropinsLayout && (
                        <AutoAcceptMeetings
                          functions={{
                            setSelectedProgramData: setSelectedProgramData,
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
                            *Enter A Location And/Or Virtual Meeting Link To
                            Create Times*
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
                            Create Meeting Block
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
                                  allProgramTimesInCourse[selectedProgramId]
                                }
                                loadPage={loadProgramTable}
                                program_id={selectedProgramData.id}
                              />
                            </div>
                            {showDuration && (
                              <div className="flex flex-row items-center mt-4">
                                <label className="whitespace-nowrap font-bold text-2xl">
                                  Define Meeting Duration?
                                </label>
                                <input
                                  type="checkbox"
                                  class="form-checkbox h-6 w-7 text-blue-600 ml-2 mt-1"
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
                                        const inputValue = event.target.value;
                                        const numericValue = inputValue.replace(
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
                                    setChooseMeetingDatesPopUpVisible(
                                      !isChooseMeetingDatesPopUpVisible
                                    )
                                  }
                                >
                                  Choose Meeting Dates
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          isCreateAvailabilityPopUpVisible && (
                            <div className="fixed inset-0 z-10">
                              <CreateAvailability
                                id={selectedCourseId}
                                program_id={selectedProgramData.id}
                                program_name={selectedProgramData.type}
                                duration={selectedProgramData.duration}
                                physical_location={
                                  selectedProgramData.physical_location
                                }
                                virtual_link={selectedProgramData.virtual_link}
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

      {isChooseMeetingDatesPopUpVisible && (
        <div className="fixed inset-0 z-10">
          <ChooseMeetingDatesPopup
            onClose={() => setChooseMeetingDatesPopUpVisible(false)}
            data={allProgramTimesInCourse[selectedProgramId]}
            id={selectedCourseId}
            duration={selectedProgramData.duration}
            physical_location={selectedProgramData.physical_location}
            virtual_link={selectedProgramData.virtual_link}
            program_id={selectedProgramId}
            program_name={selectedProgramData.type}
            isDropins={selectedProgramData.isDropins}
          />
        </div>
      )}

      {isCreateProgramTypePopup && (
        <div className="fixed inset-0 z-10">
          <CreateProgramTypePopup
            onClose={() => setCreateProgramTypePopup(false)}
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
