/* CreateProgramPopup.js
 * Last Edited: 3/24/24
 *
 * UI popup shown when instructor clicks on the create program button
 * in the "Programs" tab. Allows teacher to enter name of program,
 * and whether it's drop-in or appointment based
 *
 * Known Bugs:
 * -
 *
 */

import React, { useState, useEffect } from "react";
import { getCookie } from "../utils/GetCookie.js";

const CreateProgramPopup = ({ onClose, courseId, loadFunction }) => {
  // General Variables
  const csrfToken = getCookie("csrf_access_token");

  // Load Variables
  const [readyToCreate, setReadyToCreate] = useState(false);

  // Program Data Variables
  const [isDropIns, setIsDropIns] = useState(false);
  const [isAppointments, setIsAppointments] = useState(false);
  const [isRangeBased, setIsRangeBased] = useState(false);
  const [isSpecificDates, setIsSpecificDates] = useState(false);
  const [programTitle, setProgramTitle] = useState("");

  ////////////////////////////////////////////////////////
  //               Fetch Post Functions                 //
  ////////////////////////////////////////////////////////

  // posts the program to the Program table
  const createProgram = async () => {
    if (programTitle === "Course Times" && courseId === -2) {
      alert(
        'Program Name: "Course Name" is not allowed for All Course Programs. For Course Times use Single Course Programs.'
      );
      return;
    }

    try {
      const payload = {
        name: programTitle,
        course_id: courseId,
        isDropins: isDropIns,
        isRangeBased: isRangeBased,
      };

      const response = await fetch(`/program/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        // Program added successfully, reload page or update UI as needed
        loadFunction(responseData.program_id); // Pass the new program ID to the loadFunction
        onClose();
      } else if (response.status === 400) {
        window.alert("Program already exists.");
      } else {
        console.error("Failed to add program:", responseData.error);
      }
    } catch (error) {
      console.error("Error creating program:", error);
    }
  };

  ////////////////////////////////////////////////////////
  //                 Handler Functions                  //
  ////////////////////////////////////////////////////////

  // set program meeting option to drop-in
  const handleDropInChange = () => {
    if (isAppointments) {
      setIsAppointments(false);
    }
    setIsDropIns(!isDropIns);
  };

  // set program meeting option to appointment
  const handleAppointmentChange = () => {
    if (isDropIns) {
      setIsDropIns(false);
    }
    setIsAppointments(!isAppointments);
  };

  // set program meeting option to drop-in
  const handleRangeBasedChange = () => {
    if (isSpecificDates) {
      setIsSpecificDates(false);
    }
    setIsRangeBased(!isRangeBased);
  };

  // set program meeting option to appointment
  const handleSpecificDatesChange = () => {
    if (isRangeBased) {
      setIsRangeBased(false);
    }
    setIsSpecificDates(!isSpecificDates);
  };

  ////////////////////////////////////////////////////////
  //               UseEffect Functions                  //
  ////////////////////////////////////////////////////////

  // show create button if instructor picks drop-in or apppointment
  // and program title isn't empty
  useEffect(() => {
    if (
      (isDropIns || isAppointments) &&
      (isRangeBased || isSpecificDates) &&
      programTitle !== ""
    ) {
      setReadyToCreate(true);
    } else {
      setReadyToCreate(false);
    }
  }, [isDropIns, isAppointments, isRangeBased, isSpecificDates, programTitle]);

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  return (
    <div className="fixed top-1/2 left-1/2 w-1/4 transform -translate-x-1/2 -translate-y-1/2 bg-popup-gray border border-gray-300 shadow-md p-7 relative">
      <button
        className="absolute top-1 right-1 cursor-pointer fas fa-times"
        onClick={onClose}
      ></button>
      <div className="flex flex-col items-center">
        <div className="mb-1">
          <label className="font-bold text-lg">Program Name</label>
        </div>
        <div className="flex items-center">
          <input
            className="border border-light-gray hover:bg-gray"
            value={programTitle}
            onChange={(e) => setProgramTitle(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          className={`w-36 h-28 font-bold border border-light-gray rounded-md shadow-md text-2xl mr-2 hover:bg-gray ${
            isDropIns ? "bg-gold" : "bg-white"
          }`}
          onClick={handleDropInChange}
        >
          Drop-Ins
        </button>
        <button
          className={`w-40 h-28 font-bold border border-light-gray rounded-md shadow-md text-2xl ml-2 p-1 hover:bg-gray ${
            isAppointments ? "bg-gold" : "bg-white"
          }`}
          onClick={handleAppointmentChange}
        >
          Appointment Based
        </button>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          className={`w-36 h-28 font-bold border border-light-gray rounded-md shadow-md text-2xl mr-2 hover:bg-gray ${
            isRangeBased ? "bg-gold" : "bg-white"
          }`}
          onClick={handleRangeBasedChange}
        >
          Range Based
        </button>
        <button
          className={`w-40 h-28 font-bold border border-light-gray rounded-md shadow-md text-2xl ml-2 p-1 hover:bg-gray ${
            isSpecificDates ? "bg-gold" : "bg-white"
          }`}
          onClick={handleSpecificDatesChange}
        >
          Specific Dates
        </button>
      </div>

      {readyToCreate && (
        <div className="flex justify-center mt-4">
          <button
            className="bg-purple font-bold text-white rounded-md text-2xl px-5 py-1 hover:text-gold"
            onClick={createProgram}
          >
            Create
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateProgramPopup;
