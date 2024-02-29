import React, { useEffect, useState } from 'react';

const CourseInformationPopup = ({onClose, courseData, instructorData}) => {
    return (
        <div className="fixed top-1/2 left-1/2 w-5/12 transform -translate-x-1/2 -translate-y-1/2 bg-popup-gray border border-gray-300 shadow-md p-6 relative">
            <button className="absolute top-0 right-2 text-gray-500 hover:text-gray-700 cursor-pointer font-bold" onClick={onClose}>x</button>
            <h2 className="pb-10 text-center font-bold text-4xl">{courseData.class_name}</h2>
            <div className="grid grid-cols-2 font-bold">
                <div className="flex flex-col">
                    <label> Class Times: <span className="font-normal">{courseData.class_times}</span></label>
                    <label> Class Location: <span className="font-normal">{courseData.class_location}</span></label>
                    <label> Class Recordings Link: <span className="font-normal"> {courseData.class_recordings_link}</span></label>
                    <label> Comments: &nbsp; <p className="font-normal">{courseData.class_comment}</p></label>
                </div>
                <div className="flex flex-col justify-self-end">
                    <label> Office Hours: <span className="font-normal">{courseData.office_hours}</span></label>
                    <label> Office Hours Location: <span className="font-normal"> {courseData.office_hours_location}</span></label>
                    <label> Instructor: <span className="font-normal"> {instructorData.title} {instructorData.last_name}</span></label>
                    <label> Discord: <span className="font-normal">{courseData.discord_link}</span></label>
                </div>
            </div>
        </div>
    );
};

export default CourseInformationPopup;