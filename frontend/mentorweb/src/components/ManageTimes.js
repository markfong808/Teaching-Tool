import React, { useEffect, useState, useContext } from "react";
import MeetingInformation from './MeetingInformation.js'
import ManageAvailability from './ManageAvailability.js'
import { ClassContext } from "../context/ClassContext.js";
import { UserContext } from '../context/UserContext';
import { getCookie } from '../utils/GetCookie';

export default function ManageTimes() {
    // General Variables
    const csrfToken = getCookie('csrf_access_token');
    const { user } = useContext(UserContext);

    // Load Variables
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [loadAppointments, setLoadAppointments] = useState(false);

    // Class Data Variables
    const contextValue = useContext(ClassContext);
    const { classInstance } = contextValue || {};
    const [selectedCourseId, setSelectedCourseId] = useState('-1');
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






    ////////////////////////////////////////////////////////
    //               Fetch Data Functions                 //
    ////////////////////////////////////////////////////////

    // fetch from database: all courses the user is associated with
    const fetchCourseList = async () => {
        if (user.account_type !== "mentor") return;
    
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



    ////////////////////////////////////////////////////////
    //                  Load Functions                    //
    ////////////////////////////////////////////////////////

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
        updateCourseInfo(selectedCourse);

        // flag to child objects to reload their information
        // with times data or selectedClassData
        reloadChildInfo();
    };

    // update the selectedClassData based on a courseId
    const updateCourseInfo = (courseId) => {
        if (!courseId) {
        setSelectedClassData({});
        return;
        }

        const selectedCourse = allCourseData.find(course => course.id === courseId);

        if (selectedCourse) {
        // Update selectedClassData with selectedCourse
        setSelectedClassData(selectedCourse);
        }
    };

    // called when information on the webpage needs to be reloaded
    // will flag to child objects to reload their information
    const reloadChildInfo = () => {
        setLoadAppointments(!loadAppointments);
    };

    useEffect(() => {
        if (!isPageLoaded) {
          fetchCourseList();
          setIsPageLoaded(!isPageLoaded);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPageLoaded, user]);

    // Display meeting list
    return (
        <div className="flex flex-col m-auto">
            <div className="w-3/4 p-5 m-auto items-center">
                <h1 className="inline-block"> <strong>Select Course:</strong></h1>
                <select
                    className="border border-light-gray rounded ml-2"
                    id="course-dropdown"
                    value={selectedCourseId}
                    onChange={(e) => handleCourseChange(e)}
                >
                    <option key={-1} value='-1'>Select...</option>
                    {allCourseData.map((course) => (
                    <option key={course.id} value={course.id}>{course.class_name}</option>
                    ))}
                </select>
            </div>
            <div className="flex flex-col w-3/4 p-5 m-auto border border-light-gray rounded-md shadow-md">
                    <ManageAvailability courseId={selectedCourseId}/>
            </div>
            <div className="flex flex-col w-3/4 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
                    <MeetingInformation loadPage={loadAppointments} courseId={selectedCourseId}/>
            </div>
        </div>
    );
}