import React, { useEffect, useState, useContext } from "react";
import MeetingInformation from './MeetingInformation.js'
import ManageAvailability from './ManageAvailability.js'
export default function ManageTimes() {
    

    // Display meeting list
    return (
        <div className="flex flex-col m-auto">
            <div className="w-3/4 p-5 m-auto items-center">
                <h1 className="inline-block"> <strong>Select Course:</strong></h1>
                <select
                    className="border border-light-gray rounded ml-2"
                    id="course-dropdown"
                    /*value={selectedCourseId}  =======================> Trent implements 
                    onChange={(e) => handleCourseChange(e) =============> Trent implements */
                >
                    <option value="">Select...</option>
                    {/*{courseIds.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.class_name}
                        </option>
                    ))}*/}
                </select>
            </div>
            <div className="flex flex-col w-3/4 p-5 m-auto border border-light-gray rounded-md shadow-md">
                    <ManageAvailability />
            </div>
            <div className="flex flex-col w-3/4 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
                    <MeetingInformation />
            </div>
        </div>
    );
}