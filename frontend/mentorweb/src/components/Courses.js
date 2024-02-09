import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { capitalizeFirstLetter } from '../utils/FormatDatetime';
import { getCookie } from '../utils/GetCookie';
import { Tooltip } from './Tooltip';
import Meetings from './Meetings';
import { ClassContext } from "../context/ClassContext.js";

export default function Courses() {
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
        name: classInstance?.class_name || '',
        info: classInstance?.class_comment || '',
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

    const fetchCourseList = async () => {
        if (user.account_type !== "student") return;

        const apiEndpoint = `/student/courses`;

        try {
            const response = await fetch(apiEndpoint, {
                credentials: 'include',
            });
            const fetchedCourseIds = await response.json();
            setCourseIds(fetchedCourseIds);
        } catch (error) {
            console.error("Error fetching course list:", error);
        }
    };

    const fetchCourseInfo = async (courseId) => {
        if (user.account_type !== "student") return;

        try {
            const courseInfoResponse = await fetch(`/student/course-info/${courseId}`, {
                credentials: 'include',
            });

            const courseTempData = await courseInfoResponse.json();

            fetchInstructorInfo(courseTempData.teacher_id);  // make sure this works

            setClassData(courseTempData);
        } catch (error) {
            console.error("Error fetching course info:", error);
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
        const selectedCourse = e.target.value;
        setSelectedCourseId(selectedCourse);
        fetchCourseInfo(selectedCourse);
    };
    

    return (
        <div className="flex flex-col w-7/8 m-auto">
            <div className="flex flex-col w-2/3 p-5 m-auto">
                <div id="dropdown" className=''>
                    <h1><strong>Select Course:</strong></h1>
                    <select
                        className='border border-light-gray rounded'
                        id="course-dropdown"
                        value={selectedCourseId}
                        onChange={handleCourseChange}
                    >
                        <option value="">Select...</option>
                        {courseIds.map((courseId) => (
                            <option key={courseId} value={courseId}>
                                Course {courseId}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md">
                <h2 className='pb-10 text-center font-bold text-2xl'>{classData.class_name}</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className='font-bold'>Class Times: <span style={{ fontWeight: 'normal' }}>{classData.class_time}</span></label>
                        <label className='font-bold'>Class Location: <span style={{ fontWeight: 'normal' }}>{classData.class_location}</span></label>
                        <label className='font-bold'>Class Recordings Link: <span style={{ fontWeight: 'normal' }}>{classData.class_recordings_link}</span></label>
                        <label className='font-bold'>Comments: &nbsp; <p style={{ fontWeight: 'normal' }}>{classData.class_comment}</p></label>
                    </div>
                    <div className="flex flex-col justify-self-end">
                        <label className='font-bold'>Office Hours: <span style={{ fontWeight: 'normal' }}>{classData.office_hours_time}</span></label>
                        <label className='font-bold'>Office Hours Location: <span style={{ fontWeight: 'normal' }}>{classData.office_hours_location}</span></label>
                        <label className='font-bold'>Instructor: 
                            <span style={{ fontWeight: 'normal' }}>{instructorData.title}</span>
                            <span style={{ fontWeight: 'normal' }}>{instructorData.last_name}</span>
                        </label>
                        <label className='font-bold'>Discord:  <span style={{ fontWeight: 'normal' }}>{instructorData.discord_link}</span></label>
                    </div>
                </div>
            </div>

            {/*REDO CSS CODE HERE*/}
            <div style={{ padding: '10px' }}>
            </div>

            {/* Second Box */}
            <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md">
                <Meetings />
            </div>

            <div style={{ padding: '10px' }}>
            </div>

            {/* Third Box */}
            <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md">
                <button className="bg-purple p-2 m-2 rounded-md text-white hover:text-gold" /*onClick={() => handleTabClick('upcoming') }*/>Schedule New Meeting</button >
            </div>
        </div >
    );
}
