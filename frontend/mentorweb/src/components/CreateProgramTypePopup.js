import React, { useState, useContext, useEffect } from 'react';

const CreateProgramTypePopup = ({onClose}) => {
    return (
        <div className="fixed top-1/2 left-1/2 w-1/3 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 shadow-md p-6 relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer" onClick={onClose}>Close</button>
            <div>
                    
            </div>
        </div>
    );
};

export default CreateProgramTypePopup;
