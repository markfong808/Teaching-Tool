import React, { useEffect, useState } from "react";
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SingleInputTimeRangeField } from '@mui/x-date-pickers-pro/SingleInputTimeRangeField';

export default function WeeklyCalendar({ isClassTimes, param, times, loadPage }) {

    const [buttonVisible, setButtonVisible] = useState({
        Monday: true,
        Tuesday: true,
        Wednesday: true,
        Thursday: true,
        Friday: true,
    });

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

    const [timeRange, setTimeRange] = useState(['12:00', '12:30']);

    // edit timeRange onChange for TimeRangePicker
    const handleTimeChange = (event) => {
        const tempTimeRange = [
            event[0] && event[0].format('HH:mm'),
            event[1] && event[1].format('HH:mm')
        ];
        setTimeRange(tempTimeRange);
        
    };

    // create button to push time block to parent function
    const handleCreateChange = (day, newTimeRange) => {
        setWeekdaysList({ ...weekdaysList, day: newTimeRange });
        param.functionPassed({
            type: `${isClassTimes ? 'class_times' : 'office_hours'}`,
            name: day,
            value: newTimeRange
        });

        setButtonVisible((prevButtonVisible) => ({
            ...prevButtonVisible,
            [day]: !prevButtonVisible[day],
        }));
    };

    useEffect(() => {
        // if table should be loaded with values
        if (loadPage) {
            // load the headers: weekday titles
            const updatedTimePickersList = { ...timePickersList };
            for (const day in times) {
                if (times.hasOwnProperty(day)) {
                    updatedTimePickersList[day] = true;
                }
            }
            setTimePickers(updatedTimePickersList);

            //load the times
            const updatedWeekdaysList = { ...weekdaysList };
            for (const day in times) {
                if (times.hasOwnProperty(day)) {
                    const start = dayjs(`2022-04-17T${times[day].start_time}`);
                    const end = dayjs(`2022-04-17T${times[day].end_time}`);
                    updatedWeekdaysList[day] = {start_time: start, end_time: end };
                }
            }
            setWeekdaysList(updatedWeekdaysList);
            console.log(updatedWeekdaysList);

            param.loadPageFunction(!loadPage);
        }
        console.log(buttonVisible);
    }, [timePickersList, times]);

    // Display meeting list
    return (
        <div>
            <div>
                <div className="font-bold text-2xl mb-4">
                    <label style={{ whiteSpace: 'nowrap' }}>{isClassTimes ? "Set Class Time:" : "Set Office Hours:"}</label>
                </div>
            </div>
            <div>
                    <table className="w-full">
                        <thead className="border">
                            <tr>
                            <th
                                className={`border-r w-1/5 ${timePickersList.Monday ? 'bg-light-gray' : 'bg-white'}`}
                                name="Monday"
                                onClick={() => setTimePickers((prevTimePickers) => ({ ...prevTimePickers, Monday: !prevTimePickers.Monday }))}>
                                Monday
                            </th>

                            <th
                                className={`border-r w-1/5 ${timePickersList.Tuesday ? 'bg-light-gray' : 'bg-white'}`}
                                name="Tuesday"
                                onClick={() => setTimePickers((prevTimePickers) => ({ ...prevTimePickers, Tuesday: !prevTimePickers.Tuesday }))}>
                                Tuesday
                            </th>

                            <th
                                className={`border-r w-1/5 ${timePickersList.Wednesday ? 'bg-light-gray' : 'bg-white'}`}
                                name="Wednesday"
                                onClick={() => setTimePickers((prevTimePickers) => ({ ...prevTimePickers, Wednesday: !prevTimePickers.Wednesday }))}>
                                Wednesday
                            </th>

                            <th
                                className={`border-r w-1/5 ${timePickersList.Thursday ? 'bg-light-gray' : 'bg-white'}`}
                                name="Thursday"
                                onClick={() => setTimePickers((prevTimePickers) => ({ ...prevTimePickers, Thursday: !prevTimePickers.Thursday }))}>
                                Thursday
                            </th>

                            <th
                                className={`border-r w-1/5 ${timePickersList.Friday ? 'bg-light-gray' : 'bg-white'}`}
                                name="Friday"
                                onClick={() => setTimePickers((prevTimePickers) => ({ ...prevTimePickers, Friday: !prevTimePickers.Friday }))}>
                                Friday
                            </th>
                            </tr>
                        </thead>
    
                        <br />
                        <tbody>
                                <td>
                                    {timePickersList.Monday && (
                                        <div className={`flex flex-col items-center`}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <SingleInputTimeRangeField
                                                    label="Set Time"
                                                    defaultValue={[
                                                        weekdaysList["Monday"].start_time,
                                                        weekdaysList["Monday"].end_time,
                                                    ]}
                                                    onChange={handleTimeChange}
                                                    onBlur={() => handleCreateChange("Monday", timeRange)}
                                                />
                                            </LocalizationProvider>
                                        </div>
                                    )}
                                </td>

                                <td>
                                    {timePickersList.Tuesday && (
                                        <div className={`flex flex-col items-center`}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <SingleInputTimeRangeField
                                                    label="Set Time"
                                                    defaultValue={[
                                                        weekdaysList["Tuesday"].start_time,
                                                        weekdaysList["Tuesday"].end_time,
                                                    ]}
                                                    onChange={handleTimeChange}
                                                    onBlur={() => handleCreateChange("Tuesday", timeRange)}
                                                />
                                            </LocalizationProvider>
                                        </div>
                                    )}
                                </td>

                                <td>
                                    {timePickersList.Wednesday && (
                                        <div className={`flex flex-col items-center`}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <SingleInputTimeRangeField
                                                    label="Set Time"
                                                    defaultValue={[
                                                        weekdaysList["Wednesday"].start_time,
                                                        weekdaysList["Wednesday"].end_time,
                                                    ]}
                                                    onChange={handleTimeChange}
                                                    onBlur={() => handleCreateChange("Wednesday", timeRange)}
                                                />
                                            </LocalizationProvider>
                                        </div>
                                    )}
                                </td>

                                <td>
                                    {timePickersList.Thursday && (
                                        <div className={`flex flex-col items-center`}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <SingleInputTimeRangeField
                                                    label="Set Time"
                                                    defaultValue={[
                                                        weekdaysList["Thursday"].start_time,
                                                        weekdaysList["Thursday"].end_time,
                                                    ]}
                                                    onChange={handleTimeChange}
                                                    onBlur={() => handleCreateChange("Thursday", timeRange)}
                                                />
                                            </LocalizationProvider>
                                        </div>
                                    )}
                                </td>

                                <td>
                                    {timePickersList.Friday && (
                                        <div className={`flex flex-col items-center`}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <SingleInputTimeRangeField
                                                    label="Set Time"
                                                    defaultValue={[
                                                        weekdaysList["Friday"].start_time,
                                                        weekdaysList["Friday"].end_time,
                                                    ]}
                                                    onChange={handleTimeChange}
                                                    onBlur={() => handleCreateChange("Friday", timeRange)}
                                                />
                                            </LocalizationProvider>
                                        </div>
                                    )}
                                </td>
                        </tbody>
                    </table>
                </div>
    
        </div>
    );
}