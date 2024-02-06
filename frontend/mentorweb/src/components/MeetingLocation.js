import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { formatTime, formatDate, getDayFromDate, capitalizeFirstLetter } from "../utils/FormatDatetime.js";
import { getCookie } from "../utils/GetCookie.js"
import { Tooltip } from "../components/Tooltip.js";
import Comment from "../components/Comment.js";
import TimeRangePicker from '@wojtekmaj/react-timerange-picker';


export default function MeetingLocation() {
    const [inPerson, setInPerson] = useState(false);
    const [boxShown, setBoxShown] = useState(false);
    //  const [location, setLocation] = 

    const showBox = () => {
        if (boxShown) {
            setBoxShown(false);
        }
        else {
            setBoxShown(true);
        }
    };

    return (
        <div className="flex ml-10">
            {/* Set Class Location Box */}
            <div className="flex flex-col w-1/3 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
                <div className="font-bold text-2xl mb-4 flex items-center">
                    <label style={{ whiteSpace: 'nowrap' }}>{"Set Class Location:"}</label>
                    <button className="border-2 border-black px-3 py-3 square ml-4 mt-1" onClick={showBox}></button>
                    <span className="px-2 py-2" style={{ fontWeight: 'normal', fontSize: '14px', whiteSpace: 'nowrap' }}>In-Person?</span>
                    {boxShown && (
                        <textarea
                            className='border border-light-gray mb-2 px-2 py-0 ml-4 mt-3 w-20 h-15 text-sm'
                        />
                    )}
                </div>
            </div>
            {/* Meeting Location and Recording Link */}
            <div className="flex flex-col w-1/3 p-5 border border-light-gray rounded-md shadow-md mt-5 pl-10 mr-10">
                <div className="font-bold text-2xl mb-4 flex items-center">
                <label style={{ whiteSpace: 'nowrap' }}>{"Class Recording Link:"}</label>
                </div>
            </div>
        </div>

    );
}