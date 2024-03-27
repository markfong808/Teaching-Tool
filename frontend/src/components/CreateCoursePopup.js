/* CreateCoursePopup.js
 * Last Edited: 3/26/24
 *
 * UI popup shown when instructor clicks on the create course button
 * in the "Program Details" tab. Allows instructor to enter name of course
 *
 * Known Bugs:
 * -
 *
 */

import React, { useState, useEffect, useContext } from "react";
import { getCookie } from "../utils/GetCookie.js";
import { UserContext } from "../context/UserContext.js";
import { isnt_Instructor } from "../utils/checkUser.js";

const CreateCoursePopup = ({ onClose, user_id, loadFunction }) => {
  // General Variables
  const csrfToken = getCookie("csrf_access_token");
  const { user } = useContext(UserContext);

  // Load Variables
  const [readyToCreate, setReadyToCreate] = useState(false);

  // course Data Variables
  const [courseTitle, setCourseTitle] = useState("");

  ////////////////////////////////////////////////////////
  //               Fetch Post Functions                 //
  ////////////////////////////////////////////////////////

  // posts the course to the CourseDetails Table
  const createCourse = async () => {
    // user isn't an instructor
    if (isnt_Instructor(user)) return;

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
        // Course created successfully, reload page and update UI as needed
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

  // show create button if course title is valid
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
    // Define CreateCoursePopup component dimensions, color, and position for display
    <div className="fixed top-1/2 left-1/2 w-1/4 transform -translate-x-1/2 -translate-y-1/2 bg-popup-gray border border-gray-300 shadow-md p-7 relative">
      {/* Button to close out of CreateCoursePopup */}
      <button
        className="absolute top-1 right-1 cursor-pointer fas fa-times"
        onClick={onClose}
      ></button>

      {/* Display Course Name label and input field for instructor to enter Course Name */}
      <div className="flex flex-col items-center">
        {/* Course Name label */}
        <div className="mb-1">
          <label className="font-bold text-lg">Course Name</label>
        </div>
        
        {/* Course Name input field */}
        <div className="flex items-center">
          <input
            className="border border-light-gray hover:bg-gray"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
          />
        </div>
      </div>

      {/* Once instructor enters Course name, the create button shows*/}
      {readyToCreate && (
        <div className="flex justify-center mt-4">
          {/* Create button */}
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
