/* Program.js
 * Last Edited: 3/3/24
 * 
 * Class Availability tab for Instructor Role.
 * Instructor can choose if they're creating, updating, or deleting
 * program types, availability, description, 
 * meeting duration, location, and virtual meeting links
 * for a class or globally that applies to all classes.
 * 
 * Known Bugs:
 * - Comment on line 623 in showBox -> need to make work with save/cancel changes button
 * - ToolTip UI Box next to Create Program Type button needs adjusting
 * - Not a bug, but line 197 setAllTimesData(fetchedProgramTimes) is commented out
 * 
*/

import React, { useState, useContext, useEffect, useCallback } from "react";
import { UserContext } from "../context/UserContext.js";
import { getCookie } from "../utils/GetCookie.js";
import { Tooltip } from "./Tooltip.js";
import WeeklyCalendar from "./WeeklyCalendar.js";
import { ClassContext } from "../context/ClassContext.js";
import ChooseMeetingDatesPopup from "./ChooseMeetingDatesPopup.js";
import MeetingLocation from "./MeetingLocation.js";
import CreateProgramTypePopup from "./CreateProgramTypePopup.js";

export default function Program() {
  // General Variables
  const csrfToken = getCookie("csrf_access_token");
  const { user } = useContext(UserContext);
  const [changesMade, setChangesMade] = useState(false);
  const [boxShown, setBoxShown] = useState(false);
  const [isPopUpVisible, setPopUpVisible] = useState(false);
  const [isCreateProgramTypePopup, setCreateProgramTypePopup] = useState(false);

  // Load Variables
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [loadProgramTable, setLoadProgramTable] = useState(false);
  const [resetOfficeHoursTable, setResetOfficeHoursTable] = useState(false);
  const [loadLocRec, setLocRec] = useState(false);
  const [post, setPost] = useState(false);
  const [isCourseSelected, setIsCourseSelected] = useState(true);
  const [isProgramSelected, setIsProgramSelected] = useState(false);
  const [locationChecker, setLocationChecker] = useState(false);
  const [timeChecker, setTimeChecker] = useState(false);
  const [enableDurationAndDates, setEnableDurationAndDates] = useState(false);
  const [isAllCoursesSelected, setIsAllCoursesSelected] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isDropinsLayout, setIsDropinsLayout] = useState(true);

  // Class Data Variables
  const [selectedCourseId, setSelectedCourseId] = useState("-2");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [allCourseData, setAllCourseData] = useState([]);
  const [selectedClassData, setSelectedClassData] = useState({
    id: "",
    class_name: "",
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
  });

  const [showSaveCancelButtons, setShowSaveCancelButtons] = useState({
    class_id: true,
    type: true,
    description: true,
    duration: true,
    physical_location: true,
    virtual_link: true,
  });

  // Times Data Variables
  const [allTimesData, setAllTimesData] = useState({});
  const [selectedProgramTimesData, setSelectedProgramTimesData] = useState({});

  ////////////////////////////////////////////////////////
  //               Fetch Get Functions                  //
  ////////////////////////////////////////////////////////

  // fetch all courses the instructor is associated with
  const fetchCourseList = async () => {
    if (user.account_type !== "mentor") return;

    try {
      const response = await fetch(`/mentor/courses`, {
        credentials: "include",
      });

      const fetchedCourseList = await response.json();
      setAllCourseData(fetchedCourseList);

      if (!hasLoaded) {
        // check for a global program in fetched course list with unique id -2 
        const containsGlobalPrograms = fetchedCourseList.find(
          (course) => course.id === -2
        );

        // if there is a global program
        if (containsGlobalPrograms) {
          setSelectedCourseId(containsGlobalPrograms.id); // set selectedCourseId to containsGlobalPrograms.id
          updateCourseInfo(containsGlobalPrograms.id); // update the courseInfo with the containsGlobalPrograms.id
        }
        setHasLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching course list:", error);
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "FetchTimesData failed");
      }

      const fetchedCourseTimes = await response.json();
  
      if (fetchedCourseTimes !== null) {
        // create a tempData object and loop through fetchedCourseTimes
        const tempData = fetchedCourseTimes
          .filter((item) => item.type !== "Class Times") // filter out fetchedCoursesTimes by "class times" type
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
        setAllTimesData(tempData);
      } else {
        setAllTimesData({});
      }
    } catch (error) {
      console.error("Error fetching time info:", error);
    }
  };

 // fetch selectedProgramTimes associated with the programId
  const fetchSelectedProgramTimesData = async (programId) => {
    if (!programId || programId === "-1") {
      setSelectedProgramTimesData({});
      return;
    }

    try {
      const response = await fetch(
        `/program/times/${encodeURIComponent(programId)}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "FetchTimesData failed");
      }

      const fetchedProgramTimes = await response.json();

      if (fetchedProgramTimes !== null) {
        //setAllTimesData(fetchedProgramTimes);

        const tempData = fetchedProgramTimes.reduce((acc, item) => {
          // add start_time and end_time to the accumulator object based on the day
          acc[item.day] = {
            start_time: item.start_time,
            end_time: item.end_time,
          };
          return acc;
        }, {});

        // set selectedProgramTimesData to tempData
        setSelectedProgramTimesData(tempData);
      } else {
        setSelectedProgramTimesData({});
      }
    } catch (error) {
      console.error("Error fetching time info:", error);
    }
  };

  ////////////////////////////////////////////////////////
  //               Fetch Post Functions                 //
  ////////////////////////////////////////////////////////

  // called when user clicks save changes button
  // saves all class and times details to database
  const handleSaveChanges = async () => {
    if (Object.keys(selectedProgramTimesData).length > 0) {
      setAllTimesData({
        ...allTimesData,
        [selectedProgramId]: selectedProgramTimesData,
      });
      setPost(true);
    }
    if (selectedProgramData) {
      postProgramToDatabase();
    }
  };

  // posts updated program data for a class to the ProgramType table
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

      setChangesMade(false); // Hide Save/Cancel Buttons
    } catch (error) {
      console.error("Error saving program type details:", error);
    }
  };

  // handleSaveChanges helper: update ClassTimes table in database for attached course
  // called in a UseEffect below
  const postClassDetailsToDatabase = async () => {
    try {
      await fetch(
        `/course/setTime/${encodeURIComponent(selectedClassData.id)}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": csrfToken,
          },
          body: JSON.stringify(allTimesData),
        }
      );

      setChangesMade(false); // Hide Save/Cancel Buttons
    } catch (error) {
      console.error("Error saving class details:", error);
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
          await fetchCourseList();
          handleProgramChange({ target: { value: "-1" } });
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

    // reset program information 
    setSelectedProgramId(-1);
    updateProgramInfo(-1);
    setSelectedProgramTimesData({});

    // update timesData to selectedCourse
    fetchTimesData(selectedCourse);
   
    reloadChildInfo();
    setChangesMade(false);
  };

  // helper function called when information on the webpage needs to be reloaded
  // will flag to child objects to reload their information
  const reloadChildInfo = () => {
    setLoadProgramTable(!loadProgramTable);
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

    // update programTimesData to selectedProgram
    fetchSelectedProgramTimesData(selectedProgram);
    setSelectedProgramTimesData(selectedProgramTimesData[selectedProgram]);

    setChangesMade(false);
  };


  // update the selectedClassData based on a courseId
  const updateCourseInfo = (courseId) => {
    if (!courseId) {
      setSelectedClassData({});
      return;
    }

    const selectedCourse = allCourseData.find(
      (course) => course.id === courseId
    );

    if (selectedCourse) {
      // Update selectedClassData with selectedCourse.id
      setSelectedClassData(selectedCourse);
    } else {
      setSelectedClassData({
        id: "",
        class_name: "",
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
      });

      setBoxShown(false);
      return;
    }

    const selectedProgram = selectedClassData.programs.find(
      (program) => program.id === programId
    );

    if (!selectedProgram.duration) {
      selectedProgram.duration = "";
    }

    if (selectedProgram) {
      // Update selectedProgramData with selectedProgram.id
      setSelectedProgramData(selectedProgram);
    }

    if (!selectedProgram.duration || selectedProgram.duration === "") {
      setBoxShown(false);
    }
  };

  // update classData with instructor input
  const handleInputChange = (e) => {
    if (!e || (e.target.name === "duration" && e.target.value.includes("a"))) {
      return;
    }

    // if name is duration check the duration provided by instructor
    if (e.target.name === "duration") {
      if (Number(e.target.value) > 0) {
        let maxRecommendedTimeSplit = 1440;

        // iterate through selectedProgramTimesData 
        for (const data of Object.entries(selectedProgramTimesData)) {
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
            window.alert(
              "Time Split value is too large. Lower your time split"
            );
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

    // update selectedClassData.programs to the selectedProgramData
    const selectedCourse = selectedClassData.programs.find(
      (program) => program.id === selectedProgramData.id
    );

    // Update showButtons state
    setShowSaveCancelButtons((prevButtons) => ({
      ...prevButtons,
      [e.target.name]: e.target.value === selectedCourse[e.target.name],
    }));
  };

  // update timesData based on instructor entries
  const handleTimesChange = (e) => {
    if (!e) {
      return;
    }

    const tempType = e.type;
    const tempDay = e.name;
    const tempValue = e.value;

    // Create a new times data object to store the selectedProgramTimesData 
    let updatedTimesData = { ...selectedProgramTimesData };

    // Check if the day already exists in selectedProgramTimesData
    if (tempValue.length === 0) {
      // If e.value.length == 0, delete the day from selectedProgramTimesData
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

    // Set the selectedProgramTimesData variable
    setSelectedProgramTimesData(updatedTimesData);
  };

  // update selectedProgramData meeting limit's based on instructor entries
  const handleLimitInputChange = (e) => {
    const { name, value } = e.target;
    let newLimitData = {
      ...selectedProgramData,
      [name]: parseInt(value, 10) || 0,
    };

    // Ensure daily limit doesn't exceed weekly or total limit
    if (name === "max_daily_meetings") {
      if (newLimitData.max_daily_meetings > newLimitData.max_weekly_meetings) {
        newLimitData.max_weekly_meetings = newLimitData.max_daily_meetings;
      }
      if (newLimitData.max_daily_meetings > newLimitData.max_monthly_meetings) {
        newLimitData.max_monthly_meetings = newLimitData.max_daily_meetings;
      }
    }

    // Ensure weekly limit is between daily limit and total limit
    if (name === "max_weekly_meetings") {
      if (newLimitData.max_weekly_meetings < newLimitData.max_daily_meetings) {
        newLimitData.max_daily_meetings = newLimitData.max_weekly_meetings;
      }
      if (
        newLimitData.max_weekly_meetings > newLimitData.max_monthly_meetings
      ) {
        newLimitData.max_monthly_meetings = newLimitData.max_weekly_meetings;
      }
    }

    // Ensure total limit isn't less than daily or weekly limit
    if (name === "max_monthly_meetings") {
      if (newLimitData.max_monthly_meetings < newLimitData.max_daily_meetings) {
        newLimitData.max_daily_meetings = newLimitData.max_monthly_meetings;
      }
      if (
        newLimitData.max_monthly_meetings < newLimitData.max_weekly_meetings
      ) {
        newLimitData.max_weekly_meetings = newLimitData.max_monthly_meetings;
      }
    }

    // update selectedProgramData with new max daily, weekly, and montly meeting numbers
    setSelectedProgramData({
      ...selectedProgramData,
      max_daily_meetings: newLimitData.max_daily_meetings,
      max_weekly_meetings: newLimitData.max_weekly_meetings,
      max_monthly_meetings: newLimitData.max_monthly_meetings,
    });
  };

  // handle to cancel webpage changes when instructor is done editing details
  const handleCancelChanges = () => {
    // Reset courseinfo, program info, adn officeHoursTable to initial data
    updateCourseInfo(selectedClassData.id);
    updateProgramInfo(selectedProgramId);
    setResetOfficeHoursTable(true);
    reloadChildInfo();
    if (allTimesData[selectedProgramId]) {
      setSelectedProgramTimesData(allTimesData[selectedProgramId]); // resetSelectedProgramTimesData to selectedProgramId
    } else {
      setSelectedProgramTimesData({});
    }
    setChangesMade(false); // Reset changes made
  };

  
  // updates setBoxShown when instructor clicks on checkbox
  const showBox = () => {
    if (boxShown) {
      // need to make work with save/cancel changes button
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
      handleCourseChange({ target: { value: "-2" } }); // -2 associated with all course programs having global type
    } else {
      handleCourseChange({ target: { value: "-1" } }); // no global type with single course 
    }
  };

  ////////////////////////////////////////////////////////
  //               UseEffects Functions                 //
  ////////////////////////////////////////////////////////

  // post to database once changes save
  useEffect(() => {
    if (post) {
      postClassDetailsToDatabase();
    }
  }, [post]);

  // on initial page load, fetchCourseList()
  useEffect(() => {
    if (!isPageLoaded) {
      fetchCourseList();
      setIsPageLoaded(!isPageLoaded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageLoaded, user]);

  // reload the child info when SelectedProgramTimesData updates
  useEffect(() => {
    reloadChildInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgramTimesData]);

  // check if all values are same as original
  useEffect(() => {
    setChangesMade(
      !Object.values(showSaveCancelButtons).every((value) => value === true)
    );
  }, [showSaveCancelButtons]);

  // update boxShown if duration is greater than 0
  // and update setIsDropinsLayout when selectedProgramData updates 
  useEffect(() => {
    if (Number(selectedProgramData.duration) > 0) {
      setBoxShown(true);
    }
    if (
      selectedProgramData.isDropins !== "" &&
      selectedProgramData.isDropins === false
    ) {
      setIsDropinsLayout(false);
    } else {
      setIsDropinsLayout(true);
    }
  }, [selectedProgramData]);

  // update courseInfo when selectedCourseId is updated
  useEffect(() => {
    if (selectedCourseId && selectedCourseId !== "-1") {
      updateCourseInfo(selectedCourseId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId, allCourseData]);

  // update isCourseSelected when selectedCourseId is updated
  useEffect(() => {
    if (
      (selectedCourseId !== "" && selectedCourseId !== -1) ||
      selectedCourseId === -2
    ) {
      setIsCourseSelected(true); // if course id valid set to true
    } else {
      setIsCourseSelected(false);
    }
  }, [selectedCourseId]);

  // update isProgramSelected when selectedProgramId is updated
  useEffect(() => {
    if (selectedProgramId !== "" && selectedProgramId !== -1) {
      setIsProgramSelected(true); // if, programid valid set to true
    } else {
      setIsProgramSelected(false);
    }
  }, [selectedProgramId]);

  // set timechecker flag to true if a selectedprogramtimes exists, and data length is > 0
  useEffect(() => {
    if (
      selectedProgramTimesData &&
      Object.keys(selectedProgramTimesData).length > 0
    ) {
      setTimeChecker(true);
    } else {
      setTimeChecker(false);
    }
  }, [selectedProgramTimesData]);

  // update setLocationChecker when selectedProgramData physical location or virtual link is
  useEffect(() => {
    if (
      (selectedProgramData.physical_location &&
        selectedProgramData.physical_location !== "") ||
      (selectedProgramData.virtual_link &&
        selectedProgramData.virtual_link !== "")
    ) {
      setLocationChecker(true); // if physical_location or virtual link valid, set to true
    } else {
      setLocationChecker(false);
    }
  }, [selectedProgramData.physical_location, selectedProgramData.virtual_link]);

  // update setEnableDurationAndDates when locationChecker and timeChecker are updated
  useEffect(() => {
    if (locationChecker && timeChecker) {
      setEnableDurationAndDates(true); 
    } else {
      setEnableDurationAndDates(false);
    }
  }, [locationChecker, timeChecker]);

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
            className={`w-1/2 text-center text-white text-lg font-bold p-1 ${
              isAllCoursesSelected ? "bg-gold" : "bg-metallic-gold"
            }`}
            onClick={() => tabSelect(true)}
          >
            All Course Programs
          </div>
          <div
            className={`w-1/2 text-center text-white text-lg font-bold p-1 ${
              isAllCoursesSelected ? "bg-metallic-gold" : "bg-gold"
            }`}
            onClick={() => tabSelect(false)}
          >
            Single Course Programs
          </div>
        </div>

        <div className="w-3/4 p-5 m-auto">
          <div className="flex justify-between">
            <div className="ml-10">
              {!isAllCoursesSelected && (
                <div className="flex">
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
                      Select...
                    </option>
                    {allCourseData.map(
                      (course) =>
                        course.id !== -2 && (
                          <option key={course.id} value={course.id}>
                            {course.class_name}
                          </option>
                        )
                    )}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center mr-10">
              <h1>
                <strong>Select Program type:</strong>
              </h1>
              <select
                className="border border-light-gray rounded ml-2"
                id="course-dropdown"
                value={selectedProgramId}
                onChange={(e) => handleProgramChange(e)}
                disabled={!isCourseSelected}
              >
                <option key={-1} value="">
                  Select...
                </option>
                {selectedClassData.programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.type}
                  </option>
                ))}
              </select>
              <button
                className={`font-bold border border-light-gray rounded-md shadow-md text-sm px-1 py-1 ml-4 ${
                  !isCourseSelected ? "opacity-50" : ""
                }`}
                onClick={() =>
                  setCreateProgramTypePopup(!isCreateProgramTypePopup)
                }
                disabled={!isCourseSelected}
              >
                Create Program Type
              </button>
              <Tooltip text='For Class Times and Office Hours programs, please use the title "Class Times" or "Office Hours" respectively'>
                <span>ⓘ</span>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-3/4 px-5 m-auto">
          <div className="py-5 border border-light-gray rounded-md shadow-md">
            <div className="relative">
              <button
                className={`font-bold border border-light-gray rounded-md shadow-md text-sm px-3 py-3 absolute inset-y-10 left-0 flex justify-center items-center ml-6 ${
                  !isProgramSelected ? "opacity-50" : ""
                }`}
                disabled={!isProgramSelected}
              >
                Auto Generate Details
              </button>
              <button
                className={`font-bold border border-light-gray rounded-md shadow-md text-sm px-3 py-3 absolute inset-y-10 right-0 flex justify-center items-center mr-6 ${
                  !isProgramSelected ? "opacity-50" : ""
                }`}
                onClick={handleDeleteProgramType}
                disabled={!isProgramSelected}
              >
                Delete Program
              </button>
            </div>
            <h2 className="pb-10 text-center font-bold text-2xl">
              Class Availability
            </h2>

            <div className="flex flex-col">
              <div className="w-3/4 m-auto">
                <div className="flex flex-col p-5 border border-light-gray rounded-md shadow-md mt-5">
                  <div>
                    <label className="font-bold">
                      Program Description &nbsp;
                    </label>
                    <Tooltip text="Description of the program type related to meetings for a class.">
                      <span>ⓘ</span>
                    </Tooltip>
                  </div>
                  <textarea
                    className="border border-light-gray mt-3"
                    name="description"
                    value={selectedProgramData.description || ""}
                    onChange={(event) => handleInputChange(event)}
                    disabled={!isProgramSelected}
                  />
                </div>
                {/* Office Hours Times */}

                <div className="flex-1 flex-col p-5 border border-light-gray rounded-md shadow-md mt-5">
                  <WeeklyCalendar
                    isCourseTimes={false}
                    param={{
                      functionPassed: handleTimesChange,
                      loadPageFunction: setLoadProgramTable,
                      changesMade: setChangesMade,
                      resetFunction: setResetOfficeHoursTable,
                    }}
                    times={selectedProgramTimesData}
                    loadPage={loadProgramTable}
                    reset={resetOfficeHoursTable}
                    program_id={selectedProgramData.id}
                    program_type={selectedProgramData.type}
                    disabled={!isProgramSelected}
                  />
                </div>

                <div className="flex flex-row items-center mt-4">
                  <label className="whitespace-nowrap font-bold text-2xl">
                    Define Meeting Duration?
                  </label>
                  <input
                    type="checkbox"
                    id="myCheckbox"
                    class="form-checkbox h-6 w-7 text-blue-600 ml-2 mt-1"
                    checked={boxShown}
                    onChange={showBox}
                    disabled={!enableDurationAndDates}
                  ></input>
                  {boxShown && (
                    <input
                      className="border border-light-gray ml-3 mt-1 w-20"
                      name="duration"
                      value={selectedProgramData.duration}
                      onChange={(event) => {
                        const inputValue = event.target.value;
                        const numericValue = inputValue.replace(/[^0-9]/g, "a"); // Remove non-numeric characters
                        handleInputChange({
                          target: { name: "duration", value: numericValue },
                        });
                      }}
                    />
                  )}
                  <button
                    className={`ms-auto font-bold border border-light-gray rounded-md shadow-md text-sm px-2 py-2 ${
                      !enableDurationAndDates ? "opacity-50" : ""
                    }`}
                    onClick={() => setPopUpVisible(!isPopUpVisible)}
                    disabled={!enableDurationAndDates}
                  >
                    Choose Meeting Dates
                  </button>
                </div>
              </div>
            </div>
            <MeetingLocation
              isClassLocation={false}
              param={{
                functionPassed: handleInputChange,
                loadPageFunction: setLocRec,
                changesMade: setChangesMade,
              }}
              data={{
                physical_location: selectedProgramData.physical_location,
                virtual_link: selectedProgramData.virtual_link,
              }}
              loadPage={loadLocRec}
              changes={changesMade}
              disabled={!isProgramSelected}
            />
            {!isDropinsLayout && (
              <div className="w-3/4 flex flex-row p-4 border border-light-gray rounded-md shadow-md m-auto mt-5">
                {user?.account_type === "mentor" && (
                  <div className="w-1/2">
                    <label className="font-bold text-lg">
                      Auto-Accept Meeting Requests?
                    </label>
                    <br />
                    <label className="ml-2">
                      Yes
                      <input
                        className="mb-3 ml-1"
                        type="radio"
                        name="auto_approve_appointments"
                        value="true"
                        checked={
                          selectedProgramData.auto_approve_appointments === true
                        }
                        onChange={handleInputChange}
                        disabled={!isProgramSelected}
                      />
                    </label>
                    &nbsp;&nbsp;
                    <label>
                      No
                      <input
                        className="ml-1"
                        type="radio"
                        name="auto_approve_appointments"
                        value="false"
                        checked={
                          selectedProgramData.auto_approve_appointments ===
                          false
                        }
                        onChange={handleInputChange}
                        disabled={!isProgramSelected}
                      />
                    </label>
                  </div>
                )}
                {user?.account_type === "mentor" && (
                  <div className="flex flex-col">
                    <h2 className="font-bold text-lg">Set Meeting Limits</h2>
                    <div className="flex flex-row justify-between">
                      <div className="flex flex-col mr-5">
                        <label>Daily Max</label>
                        <input
                          className="border border-light-gray w-28"
                          type="number"
                          name="max_daily_meetings"
                          min="1"
                          value={selectedProgramData.max_daily_meetings}
                          onChange={handleLimitInputChange}
                          disabled={!isProgramSelected}
                        />
                      </div>
                      <div className="flex flex-col mr-5">
                        <label>Weekly Max</label>
                        <input
                          className="border border-light-gray w-28"
                          type="number"
                          name="max_weekly_meetings"
                          min="1"
                          value={selectedProgramData.max_weekly_meetings}
                          onChange={handleLimitInputChange}
                          disabled={!isProgramSelected}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label>Total Max</label>
                        <input
                          className="border border-light-gray w-28"
                          type="number"
                          name="max_monthly_meetings"
                          min="1"
                          value={selectedProgramData.max_monthly_meetings}
                          onChange={handleLimitInputChange}
                          disabled={!isProgramSelected}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {changesMade && (
              <div className="flex flex-row justify-end my-5 mr-6">
                <button
                  className="bg-purple text-white rounded-md p-2 mr-2 hover:text-gold"
                  onClick={handleSaveChanges}
                >
                  Save Class Changes
                </button>
                <button
                  className="bg-purple text-white rounded-md p-2 hover:text-gold"
                  onClick={handleCancelChanges}
                >
                  Discard Class Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isPopUpVisible && (
        <div className="fixed inset-0 z-10">
          <ChooseMeetingDatesPopup
            onClose={() => setPopUpVisible(false)}
            data={selectedProgramTimesData}
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
            loadFunction={setIsPageLoaded}
          />
        </div>
      )}

      {/* Empty Space at bottom of webpage */}
      <div className="p-10"></div>
    </div>
  );
}
