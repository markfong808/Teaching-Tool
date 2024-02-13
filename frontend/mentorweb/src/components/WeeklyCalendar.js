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

export default function WeeklyCalendar({ isClassTimes, param }) {

    const [timePickersList, setTimePickers] = useState({
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
    });

    const [weekdaysList, setWeekdaysList] = useState({
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
    });

    const [timeRange, setTimeRange] = useState(['00:00', '00:30']);

    // edit timeRange onChange for TimeRangePicker
    const handleTimeChange = (event) => {
        setTimeRange(event);
    };

    // create button to push time block to parent function
    const handleCreateChange = (day, newTimeRange) => {
        setWeekdaysList({ ...weekdaysList, day: newTimeRange });
        param.functionPassed({
            name: day,
            value: newTimeRange
        });
    };

    // called when user adds a new day to class time or office hours
    // do not need for now
    /*const setClassTime = async () => {
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
    }*/

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
                    <th
                        className={`border-r text-start ${timePickersList.Monday ? 'bg-light-gray' : 'bg-white'}`}
                        name="Monday"
                        onClick={() => setTimePickers((prevTimePickers) => ({ ...prevTimePickers, Monday: !prevTimePickers.Monday }))}>
                        Monday
                    </th>

                    <th
                        className={`border-r text-start ${timePickersList.Tuesday ? 'bg-light-gray' : 'bg-white'}`}
                        name="Tuesday"
                        onClick={() => setTimePickers((prevTimePickers) => ({ ...prevTimePickers, Tuesday: !prevTimePickers.Tuesday }))}>
                        Tuesday
                    </th>

                    <th
                        className={`border-r text-start ${timePickersList.Wednesday ? 'bg-light-gray' : 'bg-white'}`}
                        name="Wednesday"
                        onClick={() => setTimePickers((prevTimePickers) => ({ ...prevTimePickers, Wednesday: !prevTimePickers.Wednesday }))}>
                        Wednesday
                    </th>

                    <th
                        className={`border-r text-start ${timePickersList.Thursday ? 'bg-light-gray' : 'bg-white'}`}
                        name="Thursday"
                        onClick={() => setTimePickers((prevTimePickers) => ({ ...prevTimePickers, Thursday: !prevTimePickers.Thursday }))}>
                        Thursday
                    </th>

                    <th
                        className={`border-r text-start ${timePickersList.Friday ? 'bg-light-gray' : 'bg-white'}`}
                        name="Friday"
                        onClick={() => setTimePickers((prevTimePickers) => ({ ...prevTimePickers, Friday: !prevTimePickers.Friday }))}>
                        Friday
                    </th>
                </table>
                <br />
                
                {timePickersList.Monday && (
                    <div className='flex flex-col py-5'>
                        <label htmlFor="time">Select time:</label>
                        <TimeRangePicker
                            value={timeRange}
                            onChange={handleTimeChange}
                            disableClock={true}
                            autoFocus={true}
                        />
                        <br />
                        <button
                            className='bg-purple text-white p-2 rounded-md m-2 hover:text-gold'
                            name="Monday"
                            onClick={() => handleCreateChange("Monday", timeRange)}
                        >
                            Create
                        </button>
                    </div>
                )}

                {timePickersList.Tuesday && (
                    <div className='flex flex-col py-5'>
                        <label htmlFor="time">Select time:</label>
                        <TimeRangePicker
                            value={timeRange}
                            onChange={handleTimeChange}
                            disableClock={true}
                            autoFocus={true}
                        />
                        <br />
                        <button
                            className='bg-purple text-white p-2 rounded-md m-2 hover:text-gold'
                            name="Tuesday"
                            onClick={() => handleCreateChange("Tuesday", timeRange)}
                        >
                            Create
                        </button>
                    </div>
                )}

                {timePickersList.Wednesday && (
                    <div className='flex flex-col py-5'>
                        <label htmlFor="time">Select time:</label>
                        <TimeRangePicker
                            value={timeRange}
                            onChange={handleTimeChange}
                            disableClock={true}
                            autoFocus={true}
                        />
                        <br />
                        <button
                            className='bg-purple text-white p-2 rounded-md m-2 hover:text-gold'
                            name="Wednesday"
                            onClick={() => handleCreateChange("Wednesday", timeRange)}
                        >
                            Create
                        </button>
                    </div>
                )}

                {timePickersList.Thursday && (
                    <div className='flex flex-col py-5'>
                        <label htmlFor="time">Select time:</label>
                        <TimeRangePicker
                            value={timeRange}
                            onChange={handleTimeChange}
                            disableClock={true}
                            autoFocus={true}
                        />
                        <br />
                        <button
                            className='bg-purple text-white p-2 rounded-md m-2 hover:text-gold'
                            name="Thursday"
                            onClick={() => handleCreateChange("Thursday", timeRange)}
                        >
                            Create
                        </button>
                    </div>
                )}

                {timePickersList.Friday && (
                    <div className='flex flex-col py-5'>
                        <label htmlFor="time">Select time:</label>
                        <TimeRangePicker
                            value={timeRange}
                            onChange={handleTimeChange}
                            disableClock={true}
                            autoFocus={true}
                        />
                        <br />
                        <button
                            className='bg-purple text-white p-2 rounded-md m-2 hover:text-gold'
                            name="Friday"
                            onClick={() => handleCreateChange("Friday", timeRange)}
                        >
                            Create
                        </button>
                    </div>
                )}

            </div>

        </div>
    );
}