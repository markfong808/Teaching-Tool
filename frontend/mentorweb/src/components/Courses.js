import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { capitalizeFirstLetter } from '../utils/FormatDatetime';
import { getCookie } from '../utils/GetCookie';
import { Tooltip } from './Tooltip';
import Meetings from './Meetings';
import { ClassContext } from "../context/ClassContext.js";

export default function Courses() {
    const csrfToken = getCookie('csrf_access_token');
    const { user, setUser } = useContext(UserContext);
    const [courseIds, setCourseIds] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [instructorData, setInstructorData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        title: user?.title || '',
        last_name: user?.last_name || '',
        pronouns: user?.pronouns || '',
    });

    const contextValue = useContext(ClassContext);
    const { classInstance } = contextValue || {};
    const [classData, setClassData] = useState({
        class_name: classInstance?.class_name || '',
        class_comment: classInstance?.class_comment || '',
        class_time: classInstance?.class_time || '',
        class_location: classInstance?.class_location || '',
        class_link: classInstance?.class_link || '',
        class_recordings_link: classInstance?.class_recordings_link || '',
        office_hours_time: classInstance?.office_hours_time || '',
        office_hours_location: classInstance?.office_hours_location || '',
        office_hours_link: classInstance?.office_hours_link || '',
        discord_link: classInstance?.discord_link || '',
    });

    useEffect(() => {
        fetchCourseList();
    }, [user, classInstance]); // maybe dont need

    // can use teaching tools function
    const fetchCourseList = async () => {
        if (user.account_type !== "student") return;
    
        try {
            const response = await fetch(`/student/courses`, {
                credentials: 'include',
            });
    
            const fetchedCourseIds = await response.json();
    
            // Check if fetchedCourseIds is an array before updating state
            setCourseIds(fetchedCourseIds);
        } catch (error) {
            console.error("Error fetching course list:", error);
        }
    };
    

    const updateCourseInfo = (courseId) => {
        if (!courseId) {
            // Handle the case where courseId is not provided or is invalid
            return;
        }
    
        const selectedCourse = courseIds.find(course => course.id === courseId);

        //console.log(selectedCourse);
    
        if (selectedCourse) {
            // Update classData state with the data from the selected course
            setClassData(prevClassData => ({
                ...prevClassData,
                class_name: selectedCourse.class_name || '',
                class_comment: selectedCourse.class_comment || '',
                class_time: selectedCourse.class_time || '',
                class_location: selectedCourse.class_location || '',
                class_link: selectedCourse.class_link || '',
                class_recordings_link: selectedCourse.class_recordings_link || '',
                office_hours_time: selectedCourse.office_hours_time || '',
                office_hours_location: selectedCourse.office_hours_location || '',
                office_hours_link: selectedCourse.office_hours_link || '',
                discord_link: selectedCourse.discord_link || '',
            }));
            console.log(classData);
        } else {
            // Handle the case where the selected course is not found in courseIds
            console.error("Selected course not found in courseIds");
        }
    };
    
    

    const fetchInstructorInfo = async (teacherId) => {
        try {
            const response = await fetch(`/profile/${teacherId}`, { // syntax prob not right
                credentials: 'include',
            });

            const apiData = await response.json();

            setInstructorData(apiData);
        } catch (error) {
            console.error("Error fetching course info:", error);
        }
    };

    const handleCourseChange = (e) => {
        const selectedCourse = parseInt(e.target.value);
        setSelectedCourseId(selectedCourse);
        updateCourseInfo(selectedCourse);
    };
    

    return (
        <div className="flex flex-col w-7/8 m-auto">
            <div className="flex flex-col w-2/3 p-5 m-auto">
                <div id="dropdown" className=''>
                    <label className='font-bold' htmlFor="courseDropdown">Select a Course:</label>
                    <select id="courseDropdown" className='ml-1' onChange={(e) => handleCourseChange(e)}>
                        {courseIds.map((course) => (
                            <option key={course.id} value={course.id}>{course.class_name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md">
                <h2 className='pb-10 text-center font-bold text-2xl'>{classData.class_name}</h2>
                <div className="grid grid-cols-2 gap-4 font-bold">
                    <div className="flex flex-col">
                        <label>Class Times: <span>{classData.class_time}</span></label>
                        <label>Class Location: <span>{classData.class_location}</span></label>
                        <label>Class Recordings Link: <span>{classData.class_recordings_link}</span></label>
                        <label>Comments: &nbsp; <p>{classData.class_comment}</p></label>
                    </div>
                    <div className="flex flex-col justify-self-end">
                        <label>Office Hours: <span>{classData.office_hours_time}</span></label>
                        <label>Office Hours Location: <span >{classData.office_hours_location}</span></label>
                        <label>Instructor: 
                            <span>{instructorData.title}</span>
                            <span>{instructorData.last_name}</span>
                        </label>
                        <label>Discord:  <span>{instructorData.discord_link}</span></label>
                    </div>
                </div>
            </div>

            {/*REDO CSS CODE HERE*/}
            <div className='p-2.5'>
            </div>

            {/* Second Box */}
            <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md">
                <Meetings />
            </div>

            <div className='p-2.5'>
            </div>

            {/* Third Box */}
            <div className="flex flex-col w-1/6 p-2 m-auto border border-light-gray rounded-md shadow-md">
                <button className="bg-purple p-2 rounded-md text-white hover:text-gold" /*onClick={() => handleTabClick('upcoming') }*/>Schedule New Meeting</button >
            </div>
        </div >
    );
}
