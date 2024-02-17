import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { getCookie } from '../utils/GetCookie';
import Calendar from 'react-calendar';
import TimeRangePicker from '@wojtekmaj/react-timerange-picker';
import 'react-calendar/dist/Calendar.css';
import '@wojtekmaj/react-timerange-picker/dist/TimeRangePicker.css';

export default function ChooseMeetingDates() {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [dateRange, setDateRange] = useState(['00:00', '00:30']);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const handleCalendarChange = (event) => {
        setStartDate(event[0]);
        setEndDate(event[1]);
        setShowTimePicker(true);
    };

    const createTimeSlot = async () => {
            const csrfToken = getCookie('csrf_access_token');
            const formattedStartDate = format(startDate, 'yyyy-MM-dd');
            const formattedEndDate = format(endDate, 'yyyy-MM-dd');
            
            const data = {
                type: "office_hours",
                start_date: formattedStartDate,
                end_date: formattedEndDate,
                start_time: dateRange[0],
                end_time: dateRange[1],
            }
            console.log('data:', data);
    }

    useEffect(() => {
        console.log(startDate);
        console.log(endDate);
    });

    return (
        <div className='w-2/3 m-auto font-body'>
            <div id="calendar-container">
                <div className='flex flex-col items-center'>
                    <h2 className='font-bold pt-5'>Choose A Start And End Date:</h2>
                    <Calendar
                        onChange={handleCalendarChange}
                        selectRange={true} // Enable range selection
                        value={[startDate, endDate]}
                        minDate={new Date()} // disables past dates from being selected
                    />
                    <br />
                    {showTimePicker && (
                        <div className='flex flex-col py-5'>
                            <button className='bg-purple text-white p-2 rounded-md m-2 hover:text-gold' onClick={createTimeSlot}>Create</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
