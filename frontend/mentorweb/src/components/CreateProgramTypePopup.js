import React, { useState, useContext, useEffect } from 'react';
import { getCookie } from '../utils/GetCookie.js';

const CreateProgramTypePopup = ({onClose, courseId, loadFunction}) => {
    const csrfToken = getCookie('csrf_access_token');
    const [isDropIns, setIsDropIns] = useState(false);
    const [isAppointments, setIsAppointments] = useState(false);
    const [programTitle, setProgramTitle] = useState('');
    const [readyToCreate, setReadyToCreate] = useState(false);

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

    const handleDropInChange = () => {
        if (isAppointments === true) {
            setIsAppointments(false);
        }
        setIsDropIns(!isDropIns);
    };

    const handleAppointmentChange = () => {
        if (isDropIns === true) {
            setIsDropIns(false);
        }
        setIsAppointments(!isAppointments);
    };

    useEffect(() => {
        if ((isDropIns === true || isAppointments === true) && programTitle !== '') {
            setReadyToCreate(true);
        } else {
            setReadyToCreate(false);
        }
    }, [isDropIns, isAppointments, programTitle]);

    return (
        <div className="fixed top-1/2 left-1/2 w-1/4 transform -translate-x-1/2 -translate-y-1/2 bg-popup-gray border border-gray-300 shadow-md p-7 relative">
            <button className="absolute top-0 right-2 text-gray-500 hover:text-gray-700 cursor-pointer font-bold" onClick={onClose}>Close</button>
            <div className='flex flex-col items-center'>
                <div className='mb-1'>
                    <label className='font-bold text-lg'>Program Name:</label>
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
                <button className={`w-44 h-32 font-bold border border-light-gray rounded-md shadow-md text-2xl mr-2 ${isDropIns ? "bg-gold" : "bg-white"}`} onClick={handleDropInChange}>Drop-Ins</button>
                <button className={`w-44 h-32 font-bold border border-light-gray rounded-md shadow-md text-2xl ml-2 ${isAppointments ? "bg-gold" : "bg-white"}`} onClick={handleAppointmentChange}>Appointment Based</button>
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
