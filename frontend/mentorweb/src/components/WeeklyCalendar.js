import React, { useEffect, useState } from "react";
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SingleInputTimeRangeField } from '@mui/x-date-pickers-pro/SingleInputTimeRangeField';

export default function WeeklyCalendar({ isClassTimes, param, times, loadPage, reset, program_id, program_type }) {
  // Local Variables
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

  ////////////////////////////////////////////////////////
  //               Local Data Functions                 //
  ////////////////////////////////////////////////////////

  // edit timeRange onChange for TimeRangePicker
  const handleTimeChange = (event, day) => {
    const tempTimeRange = [
      event[0] && event[0].format('HH:mm'),
      event[1] && event[1].format('HH:mm')
    ];
    setTimeRange(tempTimeRange);

    const newValue = { start_time: event[0], end_time: event[1] };

    setWeekdaysList({ ...weekdaysList, [day]: newValue });
  };

  // create button to push time block to parent function
  const handleCreateChange = (day, newTimeRange) => {
    if (isValidTimeBlock(newTimeRange)) {
      setWeekdaysList({ ...weekdaysList, day: newTimeRange });
      param.functionPassed({
        type: `${isClassTimes ? 'class_times' : program_id }`,
        name: day,
        value: newTimeRange
      });

      param.changesMade(true);
    } else {
      console.error('Invalid time block entered.');
    }
  };

  // remove time block that user alloted 
  const handleRemoveTimeBlock = (day) => {
    setWeekdaysList(prevState => ({
      ...prevState,
      [day]: []
    }));

    param.functionPassed({
      type: `${isClassTimes ? 'class_times' : program_id }`,
      name: day,
      value: []
    });

    param.changesMade(true);
  };

  // check if time block chosen is valid
  const isValidTimeBlock = (timeRange) => {
    return timeRange[0] < timeRange[1];
  };

  // handle click that user makes on any weekday
  const handleWeekdayClick = (day) => {
    if (timePickersList[day]) {
      handleRemoveTimeBlock(day);
    }

    setTimePickers(prevState => ({
      ...prevState,
      [day]: !prevState[day]
    }));
  };



  ////////////////////////////////////////////////////////
  //               UseEffect Function                   //
  ////////////////////////////////////////////////////////
  useEffect(() => {
    // if table should be loaded with values
    if (loadPage) {
      // load the headers: weekday titles
      const updatedTimePickersList = {};
      for (const day in times) {
        if (times.hasOwnProperty(day)) {
          updatedTimePickersList[day] = true;
        }
      }
      setTimePickers(updatedTimePickersList);

      //load the times
      const updatedWeekdaysList = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
      };
      
      for (const day in times) {
        if (times.hasOwnProperty(day)) {
          const start = dayjs(`2022-04-17T${times[day].start_time}`);
          const end = dayjs(`2022-04-17T${times[day].end_time}`);
          updatedWeekdaysList[day] = { start_time: start, end_time: end };
        }
      }

      setWeekdaysList(updatedWeekdaysList);

      param.loadPageFunction(!loadPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timePickersList, times, weekdaysList, loadPage]);

  useEffect(() => {
    // if table should be loaded with values
    if (reset) {
      // load the headers: weekday titles
      const updatedTimePickersList = {};
      for (const day in times) {
        if (times.hasOwnProperty(day)) {
          updatedTimePickersList[day] = true;
        }
      }
      setTimePickers(updatedTimePickersList);

      //load the times
      const updatedWeekdaysList = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
      };
      
      for (const day in times) {
        if (times.hasOwnProperty(day)) {
          const start = dayjs(`2022-04-17T${times[day].start_time}`);
          const end = dayjs(`2022-04-17T${times[day].end_time}`);
          updatedWeekdaysList[day] = { start_time: start, end_time: end };
        }
      }

      setWeekdaysList(updatedWeekdaysList);

      param.resetFunction(!reset);
      param.loadPageFunction(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);

  // HTML for webpage 
  return (
    <div>
      <div>
        <div className="font-bold text-2xl mb-4">
          <label style={{ whiteSpace: 'nowrap' }}>{isClassTimes ? "Set Class Time:" : `Set ${program_type} Times:`}</label>
        </div>
      </div>
      <div>
            <table className="w-full">
                <thead className="border">
                    <tr>
                    <th
                        className={`border-r w-1/5 ${timePickersList.Monday ? "bg-light-gray" : "bg-white"}`}
                        name="Monday"
                        onClick={() => handleWeekdayClick("Monday")}>
                        Monday
                    </th>

                    <th
                        className={`border-r w-1/5 ${timePickersList.Tuesday ? "bg-light-gray" : "bg-white"}`}
                        name="Tuesday"
                        onClick={() => handleWeekdayClick("Tuesday")}>
                        Tuesday
                    </th>

                    <th
                        className={`border-r w-1/5 ${timePickersList.Wednesday ? "bg-light-gray" : "bg-white"}`}
                        name="Wednesday"
                        onClick={() => handleWeekdayClick("Wednesday")}>
                        Wednesday
                    </th>

                    <th
                        className={`border-r w-1/5 ${
                        timePickersList.Thursday ? "bg-light-gray" : "bg-white"}`}
                        name="Thursday"
                        onClick={() => handleWeekdayClick("Thursday")}>
                        Thursday
                    </th>

                    <th
                        className={`border-r w-1/5 ${timePickersList.Friday ? "bg-light-gray" : "bg-white"}`}
                        name="Friday"
                        onClick={() => handleWeekdayClick("Friday")}>
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
                            value={[
                                weekdaysList["Monday"].start_time,
                                weekdaysList["Monday"].end_time,
                            ]}
                            onChange={(e) => handleTimeChange(e, "Monday")}
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
                            value={[
                                weekdaysList["Tuesday"].start_time,
                                weekdaysList["Tuesday"].end_time,
                            ]}
                            onChange={(e) => handleTimeChange(e, "Tuesday")}
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
                      value={[
                        weekdaysList["Wednesday"].start_time,
                        weekdaysList["Wednesday"].end_time,
                      ]}
                      onChange={(e) => handleTimeChange(e, "Wednesday")}
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
                      value={[
                        weekdaysList["Thursday"].start_time,
                        weekdaysList["Thursday"].end_time,
                      ]}
                      onChange={(e) => handleTimeChange(e, "Thursday")}
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
                      value={[
                        weekdaysList["Friday"].start_time,
                        weekdaysList["Friday"].end_time,
                      ]}
                      onChange={(e) => handleTimeChange(e, "Friday")}
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