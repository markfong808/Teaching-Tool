/* CreateCoursePopup.js
 * Last Edited: 3/24/24
 *
 * UI popup shown when instructor clicks on the create course button
 * in the "courses" tab. Allows instructor to enter name of course
 *
 * Known Bugs:
 * -
 *
 */

import React, { useState, useEffect } from "react";
import { getCookie } from "../utils/GetCookie.js";

const CreateCoursePopup = ({ onClose, user_id, loadFunction }) => {
  // General Variables
  const csrfToken = getCookie("csrf_access_token");

  // Load Variables
  const [readyToCreate, setReadyToCreate] = useState(false);

  // course Data Variables
  const [courseTitle, setCourseTitle] = useState("");

  ////////////////////////////////////////////////////////
  //               Fetch Post Functions                 //
  ////////////////////////////////////////////////////////

  // posts the course to the course table
  const createCourse = async () => {
    try {
      const payload = {
        name: courseTitle,
        user_id: user_id,
      };

      const response = await fetch(`/course/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Course created successfully, reload page or update UI as needed
        loadFunction();
        onClose();
      }
    } catch (error) {
      console.error("Error creating course:", error);
    }
  };

  ////////////////////////////////////////////////////////
  //               UseEffect Functions                  //
  ////////////////////////////////////////////////////////

  // show create button if course title isn't empty
  useEffect(() => {
    if (courseTitle !== "") {
      setReadyToCreate(true);
    } else {
      setReadyToCreate(false);
    }
  }, [courseTitle]);

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
          <label className="font-bold text-lg">Course Name</label>
        </div>
        <div className="flex items-center">
          <input
            className="border border-light-gray hover:bg-gray"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
          />
        </div>
      </div>

      {readyToCreate && (
        <div className="flex justify-center mt-4">
          <button
            className="bg-purple font-bold text-white rounded-md text-2xl px-5 py-1 hover:text-gold"
            onClick={createCourse}
          >
            Create
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateCoursePopup;
