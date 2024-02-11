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
        id: '',
        email: '',
        title: '',
        last_name: '',
        pronouns: '',
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
        teacher_id: classInstance?.teacher_id || '',
    });

    useEffect(() => {
        fetchCourseList();
    });

    // fetch all courses the student is associated with from database
    const fetchCourseList = async () => {
        if (user.account_type !== "student") return;

        try {
            const response = await fetch(`/student/courses`, {
                credentials: 'include',
            });

            const fetchedCourseList = await response.json();

            setCourseIds(fetchedCourseList);
        } catch (error) {
            console.error("Error fetching course list:", error);
        }
    };

    // update the course information being displayed on the webpage
    const updateCourseInfo = (courseId) => {
        if (!courseId) {
            return;
        }

        const selectedCourse = courseIds.find(course => course.id === courseId);

        if (selectedCourse) {
            // Update classData with selectedCourse
            setClassData(selectedCourse);

            // fetch instructor information from selected course
            fetchInstructorInfo(selectedCourse.teacher_id);
        } else {
            console.error("Selected course not found");
        }
    };

    // fetch instructor information from a user based on their ID
    const fetchInstructorInfo = async (teacherId) => {
        try {
            const response = await fetch(`/profile/instructor/${encodeURIComponent(teacherId)}`, {
                credentials: 'include',
            });

            const fetchedInstructorInfo = await response.json();

            // set instructor data with fetched data
            setInstructorData(fetchedInstructorInfo);
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
                <div id="dropdown">
                    <h1 className='inline-block'><strong>Select Course:</strong></h1>
                    <select
                        className='border border-light-gray rounded ml-2'
                        id="course-dropdown"
                        value={selectedCourseId}
                        onChange={(e) => handleCourseChange(e)}
                    >
                        <option value="">Select...</option>
                        {courseIds.map((course) => (
                            <option key={course.id} value={course.id}>{course.class_name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md">
                <h2 className='pb-10 text-center font-bold text-4xl'>{classData.class_name}</h2>
                <div className="grid grid-cols-2 gap-4 font-bold">
                    <div className="flex flex-col">
                        <label>Class Times: <span className='font-normal'>{classData.class_time}</span></label>
                        <label>Class Location: <span className='font-normal'>{classData.class_location}</span></label>
                        <label>Class Recordings Link: <span className='font-normal'>{classData.class_recordings_link}</span></label>
                        <label>Comments: &nbsp; <p className='font-normal'>{classData.class_comment}</p></label>
                    </div>
                    <div className="flex flex-col justify-self-end">
                        <label>Office Hours: <span className='font-normal'>{classData.office_hours_time}</span></label>
                        <label>Office Hours Location: <span className='font-normal'>{classData.office_hours_location}</span></label>
                        <label>Instructor: <span className='font-normal'>{instructorData.title} {instructorData.last_name}</span></label>
                        <label>Discord: <span className='font-normal'>{classData.discord_link}</span></label>
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
