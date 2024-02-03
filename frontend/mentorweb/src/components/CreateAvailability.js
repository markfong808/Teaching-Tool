import React, { useState } from 'react';
import { format } from 'date-fns';
import { getCookie } from '../utils/GetCookie';
import Calendar from 'react-calendar';
import TimeRangePicker from '@wojtekmaj/react-timerange-picker';
import 'react-calendar/dist/Calendar.css';
import '@wojtekmaj/react-timerange-picker/dist/TimeRangePicker.css';

export default function CreateAvailability() {
    const [mentorshipType, setMentorshipType] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [date, setDate] = useState(new Date());
    const [timeRange, setTimeRange] = useState(['00:00', '00:30']);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const handleMentorshipTypeChange = (event) => {
        setMentorshipType(event.target.value);
        setShowCalendar(true);
    };

    const handleCalendarChange = (event) => {
        const formattedDate = format(event, 'yyyy-MM-dd');
        setDate(formattedDate);
        console.log(formattedDate);
        setShowTimePicker(true);
    };

    const handleTimeChange = (event) => {
        setTimeRange(event);
        console.log(timeRange);
        console.log(timeRange[0]);
        console.log(timeRange[1]);
    };

    const createTimeSlot = async () => {
        if (date && timeRange) {
            const csrfToken = getCookie('csrf_access_token');
            const data = {
                type: mentorshipType,
                date: date,
                start_time: timeRange[0],
                end_time: timeRange[1],
            }
            console.log('data:' + data);
            fetch(`/mentor/add-availability`, {
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
                    alert('Failed to create availability')
                })
        }
        window.alert("Availability created successfully!");
    }

    return (
        <div className='w-2/3 m-auto font-body'>
            <div className='flex justify-center'>
                <label htmlFor="mentorship-type">Select Program Type:</label>
                &nbsp;&nbsp;
                <select className='border border-light-gray'
                    id="mentorship-type"
                    value={mentorshipType}
                    onChange={handleMentorshipTypeChange}
                    required
                >
                    <option value="" >Select...</option>
                    <option value="Mentoring Session">Mentoring Session</option>
                    <option value="Skill Development">Skill Development</option>
                    <option value="Personal Growth">Personal Growth</option>
                    <option value="Code Review">Code Review</option>
                    <option value="Mock Technical Interview">Mock Technical Interview</option>
                    <option value="Mock Behavorial Interview">Mock Behavorial Interview</option>
                </select>
            </div>

            <div id="calendar-container" className=''>
                {showCalendar && (
                    <div className='flex flex-col items-center'>
                        <h2 className='font-bold pt-5'>Create your {mentorshipType} availability</h2>
                        <Calendar
                            onChange={handleCalendarChange}
                            value={date}
                            minDate={new Date()} // disables past dates from being selected
                        />
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
                                <button className='bg-purple text-white p-2 rounded-md m-2 hover:text-gold' onClick={createTimeSlot}>Create</button>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    )
}