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
        <div>
            {/* Set Class Location Box */}
            <div className="flex flex-col w-1/2 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
                <div className="flex items-center">
                <label className="font-bold text-2xl">Set Class Location:</label>
                    <input type="checkbox" id="myCheckbox" class="form-checkbox h-5 w-5 text-blue-600 ml-5" onClick={showBox}></input>
                    <span className="px-2 py-2 text-sm font-normal">In-Person?</span>
                    
                    {boxShown && (
                        <input
                            className='border border-light-gray ml-2 text-sm font-normal'
                        />
                    )}
                </div>
            </div>

            {/* Meeting Location and Recording Link */}
            <div className="flex flex-col w-1/2 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
                <div className="flex items-center">
                    <label className="font-bold text-2xl">Class Recording Link:</label>
                    <input className='border border-light-gray ml-5 text-sm font-normal w-1/2'
                        /*type="text"
                        name="meeting_url"
                        value={formData.meeting_url}
                        onChange={handleInputChange}*/  // implement
                    />
                </div>
            </div>
        </div>

    );
}