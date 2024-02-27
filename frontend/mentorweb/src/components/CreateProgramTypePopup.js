import React, { useState, useContext, useEffect } from 'react';

const CreateProgramTypePopup = ({onClose}) => {
    const [isDropIns, setIsDropIns] = useState(true);
    const [programTitle, setProgramTitle] = useState('');

    return (
        <div className="fixed top-1/2 left-1/2 w-1/4 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 shadow-md p-7 relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer" onClick={onClose}>Close</button>
            <div className='flex flex-col items-center'>
                <div className='mb-2'>
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
                <button className={`w-44 h-32 font-bold border border-light-gray rounded-md shadow-md text-2xl mr-2 ${isDropIns ? "bg-gold" : "bg-metallic-gold"}`} onClick={() => setIsDropIns(true)}>Drop-Ins</button>
                <button className={`w-44 h-32 font-bold border border-light-gray rounded-md shadow-md text-2xl ml-2 ${isDropIns ? "bg-metallic-gold" : "bg-gold"}`} onClick={() => setIsDropIns(false)}>Appointment Based</button>
            </div>
        </div>
    );
    
};

export default CreateProgramTypePopup;
