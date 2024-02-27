import React, { useState, useContext, useEffect } from 'react';

const CreateProgramTypePopup = ({onClose}) => {
    return (
        <div className="fixed top-1/2 left-1/2 w-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 shadow-md p-6 relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer" onClick={onClose}>Close</button>
            <div className='flex items-stretch'>
                <label className='font-bold text-lg'>Program Name:</label>
                    <input
                        className="w-1/4 border border-light-gray ml-2"
                        //value={programName}
                        //onChange={(e) => setProgramName(e.target.value)}
                    />
            </div>

           
            <div className='mt-4'>
                <button className='w-1/2 font-bold border border-light-gray rounded-md shadow-md'>Drop-In</button>
                <button className='w-1/2 font-bold border border-light-gray rounded-md shadow-md'>Appointment</button>
            </div>
          

        </div>
    );
};

export default CreateProgramTypePopup;
