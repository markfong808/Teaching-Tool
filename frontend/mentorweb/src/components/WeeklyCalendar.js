import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { formatTime, formatDate, getDayFromDate, capitalizeFirstLetter } from "../utils/FormatDatetime.js";
import { getCookie } from "../utils/GetCookie.js"
import { Tooltip } from "../components/Tooltip.js";
import Comment from "../components/Comment.js";
import TimeRangePicker from '@wojtekmaj/react-timerange-picker';

/*
TO DO
 - need to connect class instance to user logged in
 - Make a custom TimeRangePicker, so it looks like wireframe
 - let use choose time blocks
 - fix createTimeSlot to actually publish new time slots
 - let the title be decided from parent function
*/

export default function WeeklyCalendar({ isClassTimes }) {
    const [changesMade, setChangesMade] = useState(false);

    // date variables
    const WeekdayList = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
    };

    const [weekdays, setWeekdays] = useState(WeekdayList);
    const [timeRange, setTimeRange] = useState(['00:00', '00:30']);
    const [availableTimeType, setAvailableTimeType] = useState('');
    const [showTimePicker, setShowTimePicker] = useState(false);

    // when the time is changed after the user clicks the days
    const handleTimeChange = (event) => {
        setTimeRange(event);
        console.log(timeRange);
        console.log(timeRange[0]);
        console.log(timeRange[1]);
    };

    // when the user clicks on a new day to schedule class or office hour times
    const handleCalendarChange = (day) => {
        setWeekdays((prevWeekdays) => {
            const updatedWeekdays = { ...prevWeekdays, [day]: !prevWeekdays[day] };
            const allFalse = Object.values(updatedWeekdays).every(value => value === false);

            setShowTimePicker(!allFalse);
            console.log('Updated weekdays:', updatedWeekdays);

            return updatedWeekdays;
        });
    };


    // called when user adds a new day to class time or office hours
    const setClassTime = async () => {
        if (WeekdayList && timeRange) {
            const csrfToken = getCookie('csrf_access_token');
            const data = {
                weekdays: weekdays,
                start_time: timeRange[0],
                end_time: timeRange[1],
            }
            console.log('classTime object:' + data);
            fetch(`/course/setTime`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(data),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to create availability');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Success:', data);
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to create add class times')
                })
        }
        window.alert("Class time added successfully!");
    }

    // Display meeting list
    return (
        <div id=" content-container" className="flex w-full m-auto items-start">
            <div className="flex-1 pr-4">
                <div className="font-bold text-2xl mb-4">
                    <label style={{ whiteSpace: 'nowrap' }}>{isClassTimes ? "Set Class Time:" : "Set Office Hours:"}</label>
                </div>
            </div>
            <div id="table" className="w-full mb-4">
                <table className="w-full border">
                    <th className={`border-r text-start ${weekdays["Monday"] ? 'bg-light-gray' : 'bg-white'}`} onClick={() => handleCalendarChange("Monday")}>Monday</th>
                    <th className={`border-r text-start ${weekdays["Tuesday"] ? 'bg-light-gray' : 'bg-white'}`} onClick={() => handleCalendarChange("Tuesday")}>Tuesday</th>
                    <th className={`border-r text-start ${weekdays["Wednesday"] ? 'bg-light-gray' : 'bg-white'}`} onClick={() => handleCalendarChange("Wednesday")}>Wednesday</th>
                    <th className={`border-r text-start ${weekdays["Thursday"] ? 'bg-light-gray' : 'bg-white'}`} onClick={() => handleCalendarChange("Thursday")}>Thursday</th>
                    <th className={`border-r text-start ${weekdays["Friday"] ? 'bg-light-gray' : 'bg-white'}`} onClick={() => handleCalendarChange("Friday")}>Friday</th>
                </table>
                <br />
                {showTimePicker && (
                    <div className='flex flex-col py-5'>
                        <label htmlFor="time">Select time:</label>
                        <TimeRangePicker
                            onChange={handleTimeChange}
                            value={timeRange}
                            disableClock={true}
                            autoFocus={true}
                        />
                        <br />
                        <button className='bg-purple text-white p-2 rounded-md m-2 hover:text-gold' onClick={setClassTime}>Create</button>
                    </div>
                )}

            </div>

        </div>
    );
}