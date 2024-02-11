import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { formatTime, formatDate, getDayFromDate, capitalizeFirstLetter } from "../utils/FormatDatetime.js"
import { getCookie } from "../utils/GetCookie.js";
import { Tooltip } from "./Tooltip.js";
import Comment from "./Comment.js";
import TimeRangePicker from "@wojtekmaj/react-timerange-picker";

export default function MeetingLocation(param) {
    const [boxShown, setBoxShown] = useState(false);

    const [formData, setFormData] = useState({
        class_location: '',
        class_recordings_link: ''
    });

    // Meeting Location show box
    const showBox = () => {
        if (boxShown) {
            setBoxShown(false);
        } else {
            setBoxShown(true);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        param.functionPassed({
            name: e.target.name,
            value: e.target.value
        });
    };

    return (
        <div>
            <div className="flex flex-col w-1/2 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
                <div className="flex items-center">
                    <label className="font-bold text-2xl">Set Class Location:</label>
                    <input type="checkbox" id="myCheckbox" class="form-checkbox h-5 w-5 text-blue-600 ml-5" onClick={showBox}></input>
                    <span className="px-2 py-2 text-sm font-normal">In-Person?</span>
                    {boxShown && (
                        <input className='border border-light-gray ml-2 text-sm font-normal'
                            name="class_location"
                            value={formData.class_location}
                            onChange={handleInputChange}
                        />
                    )}
                </div>
            </div>
            <div className="flex flex-col w-1/2 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
                <div className="flex items-center">
                    <label className="font-bold text-2xl">Class Recording Link:</label>
                    <input className='border border-light-gray ml-2 text-sm font-normal'
                            name="class_recordings_link"
                            value={formData.class_recordings_link}
                            onChange={handleInputChange}
                        />
                </div>
            </div>
        </div>

    );
}