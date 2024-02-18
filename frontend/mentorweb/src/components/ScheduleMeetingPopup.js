import React, { useState, useContext, useEffect } from 'react';
import { ClassContext } from "../context/ClassContext.js";
import { UserContext } from '../context/UserContext.js';
import ScheduleNewMeeting from './ScheduleNewMeeting.js';

const ScheduleMeetingPopup = ({ onClose, courses }) => {
    // General Variables
    const { user } = useContext(UserContext);

    // Load Variables
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    // Class Data Variables
    const contextValue = useContext(ClassContext);
    const { classInstance } = contextValue || {};
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [allCourseData, setAllCourseData] = useState([]);
    const [selectedClassData, setSelectedClassData] = useState({
        id: classInstance?.id || '',
        class_comment: classInstance?.class_comment || '',
        class_location: classInstance?.class_location || '',
        class_link: classInstance?.class_link || '',
        class_recordings_link: classInstance?.class_recordings_link || '',
        office_hours_location: classInstance?.office_hours_location || '',
        office_hours_link: classInstance?.office_hours_link || '',
        discord_link: classInstance?.discord_link || ''
    });

    // fetch from database: all courses the user is associated with
    const fetchCourseList = async () => {
        if (user.account_type !== "student") return;

        try {
            const response = await fetch(`/student/courses`, {
                credentials: 'include',
            });

            const fetchedCourseList = await response.json();

            setAllCourseData(fetchedCourseList);
        } catch (error) {
            console.error("Error fetching course list:", error);
        }
    };

    // main webpage load function
    // called when user clicks to change selected course
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
        //updateCourseInfo(selectedCourse);

        // update timesData to selectedCourseId
        //fetchTimesData(selectedCourse);

        // flag to child objects to reload their information
        // with times data or selectedClassData
        //reloadChildInfo();
    };

    useEffect(() => {
        fetchCourseList();
    });

    return (
        <div className="fixed top-1/2 left-1/2 w-3/5 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 shadow-md p-6 relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer" onClick={onClose}>Close</button>
            <div className="flex flex-col p-5 m-auto">
                <div className="flex items-center">
                    <h1 className="whitespace-nowrap"><strong>Select Course:</strong> </h1>
                    <select
                        className="border border-light-gray rounded ml-2 mt-1"
                        id="course-dropdown"
                        value={selectedCourseId}
                        onChange={(e) => handleCourseChange(e)}
                    >
                        <option value="">Select...</option>
                        {allCourseData.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.class_name}
                            </option>
                        ))}
                    </select>
                </div>
                    <div>
                        <ScheduleNewMeeting />
                    </div>
            </div>
        </div>
    );
};

export default ScheduleMeetingPopup;
