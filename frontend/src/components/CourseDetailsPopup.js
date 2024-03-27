/* CourseDetailsPopup.js
 * Last Edited: 3/26/24
 *
 * UI Popup shown when student clicks on one of the course details buttons
 * inside the "Courses" tab. Allows student to see details about
 * a course they're registered in
 *
 * Known Bugs:
 * -
 *
 */
import React from "react";

const CourseDetailsPopup = ({ onClose, courseData, instructorData }) => {
  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  return (
    // Define CourseDetailsPopup component dimensions, color, and position for display
    <div className="fixed top-1/2 left-1/2 w-5/12 transform -translate-x-1/2 -translate-y-1/2 bg-popup-gray border border-gray-300 shadow-md p-6 relative">
      {/* Close button of CourseDetailsPopup */}
      <button
        className="absolute top-1 right-1 cursor-pointer fas fa-times"
        onClick={onClose}
      ></button>

      {/* Course Name header */}
      <h2 className="pb-10 text-center font-bold text-4xl">
        {courseData.course_name}
      </h2>

      {/* Grid showing selected Course and its details*/}
      <div className="grid grid-cols-2 font-bold">
        {/* Left  Side of the CourseDetailsPopup  */}
        <div className="flex flex-col">
          {/* Course Times label and span */}
          <label>
            {" "}
            Course Times:{" "}
            <span className="font-normal">{courseData.course_times.times}</span>
          </label>

          {/* Course Location label and span */}
          <label>
            {" "}
            Course Location:{" "}
            <span className="font-normal">{courseData.physical_location}</span>
          </label>

          {/* Course Recordings Link label and span */}
          <label>
            {" "}
            Course Recordings Link:{" "}
            <span className="font-normal"> {courseData.recordings_link}</span>
          </label>

          {/* Comments label and paragraph */}
          <label>
            {" "}
            Comments: &nbsp;{" "}
            <p className="font-normal">{courseData.comments}</p>
          </label>
        </div>

        {/* Right Side of the CourseDetailsPopup  */}
        <div className="flex flex-col justify-self-end">
          {/* Office Hours label and span */}
          <label>
            {" "}
            Office Hours:{" "}
            <span className="font-normal">{courseData.office_hours.times}</span>
          </label>

          {/* Office Hours Location label and span */}
          <label>
            {" "}
            Office Hours Location:{" "}
            <span className="font-normal">
              {courseData.office_hours.physical_location}
            </span>
          </label>

          {/* Office Hours URL label and span */}
          <label>
            {" "}
            Office Hours URL:{" "}
            <span className="font-normal">{courseData.office_hours.link}</span>
          </label>

          {/* Instructor label and span */}
          <label>
            {" "}
            Instructor:{" "}
            <span className="font-normal">
              {" "}
              {instructorData.title} {instructorData.name}
            </span>
          </label>

          {/* Discord Link label and span */}
          <label>
            {" "}
            Discord Link:{" "}
            <span className="font-normal">{courseData.discord_link}</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPopup;
