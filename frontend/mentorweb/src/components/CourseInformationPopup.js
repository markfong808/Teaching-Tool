/* CourseInformationPopup.js
 * Last Edited: 3/24/24
 *
 * UI Popup shown when student clicks on one of the course details buttons
 * inside the "Courses" tab. Allows student to see information about
 * a course they're registered in
 *
 * Known Bugs:
 * - Padding issue for the information depending on course times and office hours times
 * -
 *
 */
import React from "react";

const CourseInformationPopup = ({ onClose, courseData, instructorData }) => {
  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  return (
    <div className="fixed top-1/2 left-1/2 w-5/12 transform -translate-x-1/2 -translate-y-1/2 bg-popup-gray border border-gray-300 shadow-md p-6 relative">
      <button
        className="absolute top-1 right-1 cursor-pointer fas fa-times"
        onClick={onClose}
      ></button>
      <h2 className="pb-10 text-center font-bold text-4xl">
        {courseData.course_name}
      </h2>
      <div className="grid grid-cols-2 font-bold">
        <div className="flex flex-col">
          <label>
            {" "}
            Course Times:{" "}
            <span className="font-normal">{courseData.course_times}</span>
          </label>
          <label>
            {" "}
            Course Location:{" "}
            <span className="font-normal">{courseData.course_location}</span>
          </label>
          <label>
            {" "}
            Course Recordings Link:{" "}
            <span className="font-normal">
              {" "}
              {courseData.course_recordings_link}
            </span>
          </label>
          <label>
            {" "}
            Comments: &nbsp;{" "}
            <p className="font-normal">{courseData.course_comment}</p>
          </label>
        </div>
        <div className="flex flex-col justify-self-end">
          <label>
            {" "}
            Office Hours:{" "}
            <span className="font-normal">{courseData.office_hours}</span>
          </label>
          <label>
            {" "}
            Office Hours Location:{" "}
            <span className="font-normal"> UNDER CONSTRUCTION</span>
          </label>
          <label>
            {" "}
            Instructor:{" "}
            <span className="font-normal">
              {" "}
              {instructorData.title} {instructorData.name}
            </span>
          </label>
          <label>
            {" "}
            Discord:{" "}
            <span className="font-normal">{courseData.discord_link}</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default CourseInformationPopup;
