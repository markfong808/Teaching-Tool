/* CreateProgramTypePopup.js
 * Last Edited: 3/3/24
 *
 * UI popup shown when instructor clicks on the create program type button
 * in the "Class Availability" tab. Allows teacher to enter name of program,
 * and whether it's drop-in or appointment based
 * 
 * Known Bugs:
 * - 
 * 
*/

import React, { useState, useContext, useEffect } from 'react';
import { getCookie } from '../utils/GetCookie.js';

const CreateProgramTypePopup = ({ onClose, courseId, loadFunction }) => {
    // General Variables
    const csrfToken = getCookie('csrf_access_token');

    // Load Variables
    const [readyToCreate, setReadyToCreate] = useState(false);

    // Program Type Data Variables 
    const [isDropIns, setIsDropIns] = useState(false);
    const [isAppointments, setIsAppointments] = useState(false);
    const [programTitle, setProgramTitle] = useState('');
    
    ////////////////////////////////////////////////////////
    //               Fetch Post Functions                 //
    ////////////////////////////////////////////////////////

    // posts the programtype to the ProgramType table
    const createProgramType = async () => {
        try {
            const payload = {
                name: programTitle,
                course_id: courseId,
                isDropins: isDropIns
            };

            const response = await fetch(`/course/add-program`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify(payload),
            });

            if (response.status === 400) {
                window.alert("Program Type already exists.");
            }

            loadFunction(false); // flag to reload page to add new program to dropdown selector
            onClose();
        } catch (error) {
            console.error("Error creating program:", error);
        }
    };

    ////////////////////////////////////////////////////////
    //                 Handler Functions                  //
    ////////////////////////////////////////////////////////

    // set program type meeting option to drop-in
    const handleDropInChange = () => {
        if (isAppointments === true) {
            setIsAppointments(false);
        }
        setIsDropIns(!isDropIns);
    };

    // set program type meeting option to appointment
    const handleAppointmentChange = () => {
        if (isDropIns === true) {
            setIsDropIns(false);
        }
        setIsAppointments(!isAppointments);
    };

    ////////////////////////////////////////////////////////
    //               UseEffect Functions                  //
    ////////////////////////////////////////////////////////

    // show create button if instructor picks drop-in or apppointment
    // and program title isn't empty 
    useEffect(() => {
        if ((isDropIns === true || isAppointments === true) && programTitle !== '') {
            setReadyToCreate(true);
        } else {
            setReadyToCreate(false);
        }
    }, [isDropIns, isAppointments, programTitle]);

    ////////////////////////////////////////////////////////
    //                 Render Functions                   //
    ////////////////////////////////////////////////////////

    // HTML for webpage
    return (
        <div className="fixed top-1/2 left-1/2 w-1/4 transform -translate-x-1/2 -translate-y-1/2 bg-popup-gray border border-gray-300 shadow-md p-7 relative">
            <button className="absolute top-1 right-1 cursor-pointer fas fa-times" onClick={onClose}></button>
            <div className='flex flex-col items-center'>
                <div className='mb-1'>
                    <label className='font-bold text-lg'>Program Name</label>
                </div>
                <div className='flex items-center'>
                    <input
                        className="border border-light-gray"
                        value={programTitle}
                        onChange={(e) => setProgramTitle(e.target.value)}
                    />
                </div>
            </div>


            <div className='mt-4 flex justify-center'>
                <button className={`w-36 h-28 font-bold border border-light-gray rounded-md shadow-md text-2xl mr-2 ${isDropIns ? "bg-gold" : "bg-white"}`} onClick={handleDropInChange}>Drop-Ins</button>
                <button className={`w-40 h-28 font-bold border border-light-gray rounded-md shadow-md text-2xl ml-2 p-1 ${isAppointments ? "bg-gold" : "bg-white"}`} onClick={handleAppointmentChange}>Appointment Based</button>
            </div>

            {readyToCreate && (
                <div className='flex justify-center mt-4'>
                    <button
                        className="bg-purple font-bold text-white rounded-md text-2xl px-5 py-1 hover:text-gold"
                        onClick={createProgramType}
                    >
                        Create
                    </button>
                </div>
            )}
        </div>
    );

};

export default CreateProgramTypePopup;
