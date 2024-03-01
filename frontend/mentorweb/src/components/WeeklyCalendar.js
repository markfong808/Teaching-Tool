/* WeeklyCalendar.js
 * Last Edited: 2/28/24
 *
 * Sets the general weekdays time blocks used
 * to populate the ProgramTimes table
 *
 * Known bugs:
 * - Cannot simultaneously create two time blocks at the same time
 * - Cancel button does not properly restore time blocks to original state (issue with Program.js)
 *
 */

import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { SingleInputTimeRangeField } from "@mui/x-date-pickers-pro/SingleInputTimeRangeField";

export default function WeeklyCalendar({
  isCourseTimes,
  param,
  times,
  loadPage,
  reset,
  program_id,
  program_type,
  disabled,
}) {
  // temp time range used for each SingleInputTimeRangeField
  const [timeRange, setTimeRange] = useState(["12:00", "12:30"]);

  // Store times for each weekday
  const [weekdaysList, setWeekdaysList] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
  });

  // Show SingleInputTimeRangeField UI
  const [timePickersList, setTimePickers] = useState({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
  });

  ////////////////////////////////////////////////////////
  //                 Handler Functions                  //
  ////////////////////////////////////////////////////////

  // handle onClick for each weekday header
  const handleWeekdayClick = (day) => {
    // detect remove click
    if (timePickersList[day]) {
      handleRemoveTimeBlock(day);
    }

    // flip boolean state for the weekday in timePickersList
    setTimePickers((prevState) => ({
      ...prevState,
      [day]: !prevState[day],
    }));
  };

  // edit timeRange onChange for SingleInputTimeRangeField
  const handleTimeChange = (event, day) => {
    // format to military time
    const tempTimeRange = [
      event[0] && event[0].format("HH:mm"),
      event[1] && event[1].format("HH:mm"),
    ];

    // set temp time range variable
    setTimeRange(tempTimeRange);

    const newValue = { start_time: event[0], end_time: event[1] };

    setWeekdaysList({ ...weekdaysList, [day]: newValue });
  };

  // remove time block that user allotted
  const handleRemoveTimeBlock = (day) => {
    setWeekdaysList((prevState) => ({
      ...prevState,
      [day]: [],
    }));

    param.functionPassed({
      type: `${isCourseTimes ? "class_times" : program_id}`,
      name: day,
      value: [],
    });

    param.changesMade(true);
  };

  // create button to push time block to parent function
  const handleCreateChange = (day, newTimeRange) => {
    if (isValidTimeBlock(newTimeRange)) {
      setWeekdaysList({ ...weekdaysList, day: newTimeRange });
      param.functionPassed({
        type: `${isCourseTimes ? "class_times" : program_id}`,
        name: day,
        value: newTimeRange,
      });

      param.changesMade(true);
    } else {
      console.error("Invalid time block entered.");
    }
  };

  // handleCreateChange helper: check if time block chosen is a valid range
  const isValidTimeBlock = (timeRange) => {
    return timeRange[0] < timeRange[1];
  };

  ////////////////////////////////////////////////////////
  //               UseEffect Functions                  //
  ////////////////////////////////////////////////////////

  useEffect(() => {
    // load the weekday values on page load
    if (loadPage) {
      // set the headers based on incoming data
      const updatedTimePickersList = {};
      for (const day in times) {
        if (times.hasOwnProperty(day)) {
          updatedTimePickersList[day] = true;
        }
      }
      setTimePickers(updatedTimePickersList);

      // set the times
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

      //reload data
      param.loadPageFunction(!loadPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timePickersList, times, weekdaysList, loadPage]);

  useEffect(() => {
    // reset the weekday values when cancel button is pressed
    if (reset) {
      // set the headers based on incoming data
      const updatedTimePickersList = {};
      for (const day in times) {
        if (times.hasOwnProperty(day)) {
          updatedTimePickersList[day] = true;
        }
      }
      setTimePickers(updatedTimePickersList);

      // set the times
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

      // reload data
      param.resetFunction(!reset);
      param.loadPageFunction(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // render the weekday labels with object creation onClick
  const renderWeekdayHeader = (day) => {
    return (
      <th
        className={`border-r w-1/5 ${
          timePickersList[day] ? "bg-light-gray" : "bg-white"
        } ${disabled ? "pointer-events-none opacity-50" : ""}`}
        name={day}
        onClick={() => handleWeekdayClick(day)}
      >
        {day}
      </th>
    );
  };

  // render the SingleInputTimeRangeField UI for each weekday
  const renderWeekdayBody = (day) => {
    return (
      <td>
        {timePickersList[day] && (
          <div className={`flex flex-col items-center`}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <SingleInputTimeRangeField
                label="Set Time"
                value={[
                  weekdaysList[day].start_time,
                  weekdaysList[day].end_time,
                ]}
                onChange={(e) => handleTimeChange(e, day)}
                onBlur={() => handleCreateChange(day, timeRange)}
              />
            </LocalizationProvider>
          </div>
        )}
      </td>
    );
  };

  // HTML for webpage
  return (
    <div>
      <div className="font-bold text-2xl mb-4">
        <label className="whitespace-nowrap">
          {isCourseTimes
            ? "Set Class Time:"
            : `Set ${program_type || ""} Times:`}
        </label>
      </div>

      <div>
        <table className="w-full">
          <thead className="border">
            <tr>
              {renderWeekdayHeader("Monday")}
              {renderWeekdayHeader("Tuesday")}
              {renderWeekdayHeader("Wednesday")}
              {renderWeekdayHeader("Thursday")}
              {renderWeekdayHeader("Friday")}
            </tr>
          </thead>

          <br />

          <tbody>
            {renderWeekdayBody("Monday")}
            {renderWeekdayBody("Tuesday")}
            {renderWeekdayBody("Wednesday")}
            {renderWeekdayBody("Thursday")}
            {renderWeekdayBody("Friday")}
          </tbody>
        </table>
      </div>
    </div>
  );
}
