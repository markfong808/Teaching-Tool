import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { getCookie } from '../utils/GetCookie';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '@wojtekmaj/react-timerange-picker/dist/TimeRangePicker.css';
import { addDays } from 'date-fns';

const ChooseMeetingDatesPopup = ({ onClose, data, id, duration, physical_location, virtual_link, program_id , program_type }) => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [weeklyTimes, setWeeklyTimes] = useState([]);
    const [class_id, setClassId] = useState('');

    const handleCalendarChange = (event) => {
        setStartDate(event[0]);
        setEndDate(event[1]);
        setShowTimePicker(true);
    };

    const createTimeSlot = async () => {
        if (class_id === null) {
            return;
        }

        try {
            const csrfToken = getCookie('csrf_access_token');
            let convertedAvailability = [];

            for (let date = new Date(startDate); date <= endDate; date = addDays(date, 1)) {
                const dayOfWeek = format(date, 'EEEE');
    
                if (weeklyTimes[dayOfWeek]) {
                    const { start_time, end_time } = weeklyTimes[dayOfWeek];
                    const formattedDate = format(date, 'yyyy-MM-dd');
    
                    convertedAvailability.push({
                        id: program_id,
                        type: program_type,
                        date: formattedDate,
                        start_time: start_time,
                        end_time: end_time,
                    });
                }
            }

            convertedAvailability = {
                availabilities: convertedAvailability,
                duration: duration,
                physical_location: physical_location,
                virtual_link: virtual_link
            }

            await fetch(`/mentor/add-all-availability/${encodeURIComponent(class_id)}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(convertedAvailability),
            })

            window.alert("Availabilities created successfully!");

        } catch (error) {
            console.error('Error creating availability:', error);
        }
    };

    useEffect(() => {
        setWeeklyTimes(data);
    }, [data]);

    useEffect(() => {
        setClassId(id);
    }, [id]);

    return (
        <div className="fixed top-1/2 left-1/2 w-1/3 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 shadow-md pb-7 relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer" onClick={onClose}>Close</button>
            <div className="flex flex-row py-5 m-auto">
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
            </div>
        </div>
    );
};

export default ChooseMeetingDatesPopup;