/* Program.js
 * Last Edited: 3/3/24
 *
 * Class Availability tab for Instructor Role.
 * Instructor can choose if they're creating, updating, or deleting
 * program types, availability, description,
 * meeting duration, location, and virtual meeting links
 * for a class or globally that applies to all classes.
 *
 * Known Bugs:
 * - Disable button doesnt affect details
 * - should show time somewhere??
 * - css changes to make it look better
 *
 */

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { getCookie } from "../utils/GetCookie";
import Calendar from "react-calendar";
import TimeRangePicker from "@wojtekmaj/react-timerange-picker";
import "react-calendar/dist/Calendar.css";
import "@wojtekmaj/react-timerange-picker/dist/TimeRangePicker.css";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { SingleInputTimeRangeField } from "@mui/x-date-pickers-pro/SingleInputTimeRangeField";
import dayjs from "dayjs";

export default function CreateAvailability({
  id,
  program_id,
  program_name,
  duration,
  physical_location,
  virtual_link,
  isDropins,
  onClose,
}) {
  const [date, setDate] = useState(new Date());
  const [timeRange, setTimeRange] = useState(["12:00", "12:30"]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDuration, setShowDuration] = useState(false);
  const [boxShown, setBoxShown] = useState(false);
  const [enableDurationAndDates, setEnableDurationAndDates] = useState(false);
  const [local_duration, setDuration] = useState("");
  const [timeBlock, setTimeBlock] = useState({});
  const [locationChecker, setLocationChecker] = useState(false);

  const createTimeSlot = async () => {
    if (date && timeRange) {
      const csrfToken = getCookie("csrf_access_token");

      if (!duration || duration === "") {
        duration = 0;
      } else {
        duration = Number(duration); // set duration based on passed in duration
      }

      const convertedAvailability = {
        availabilities: [
          {
            id: program_id,
            type: program_name,
            date: date,
            start_time: timeRange[0],
            end_time: timeRange[1],
          },
        ],
        duration: local_duration,
        physical_location: physical_location,
        virtual_link: virtual_link,
        isDropins: isDropins,
      };

      fetch(`/mentor/add-all-availability/${encodeURIComponent(id)}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(convertedAvailability),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to create availability");
          }
          return response.json();
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Failed to create availability");
        });
    }
    window.alert("Availability created successfully!");
  };

  const handleCalendarChange = (event) => {
    const formattedDate = format(event, "yyyy-MM-dd");
    setDate(formattedDate);
    setShowTimePicker(true);
  };

  const handleTimeChange = (event) => {
    // format to military time
    const tempTimeRange = [
      event[0] && event[0].format("HH:mm"),
      event[1] && event[1].format("HH:mm"),
    ];

    // set temp time range variable
    setTimeRange(tempTimeRange);

    const newValue = { start_time: event[0], end_time: event[1] };

    setTimeBlock(newValue);
  };

  const handleShowDuration = (event) => {
    if (isValidTimeBlock(event)) {
      setTimeBlock({
        start_time: dayjs(`2022-04-17T${event[0]}`),
        end_time: dayjs(`2022-04-17T${event[1]}`),
      });
      setShowDuration(true);
    } else {
      setShowDuration(false);
    }
  };

  // handleShowDuration helper: check if time block chosen is a valid range
  const isValidTimeBlock = (timeRange) => {
    return timeRange[0] < timeRange[1];
  };

  // updates setBoxShown when instructor clicks on checkbox
  const showBox = () => {
    if (boxShown) {
      // need to make work with save/cancel changes button
      handleDurationChange("");
      setBoxShown(false);
    } else {
      setBoxShown(true);
    }
  };

  const handleDurationChange = (duration) => {
    if (duration.includes("a")) {
      return;
    }

    // if name is duration check the duration provided by instructor
    if (Number(duration) > 0) {
      let maxRecommendedTimeSplit = 1440;

      // iterate through selectedProgramTimesData
      const startDate = new Date(`1970-01-01T${timeRange[0]}`);
      const endDate = new Date(`1970-01-01T${timeRange[1]}`);

      // calculate timeDifference into minutes
      const timeDifference = endDate - startDate;
      const minutes = Math.floor(timeDifference / (1000 * 60));

      // if maxsplit larger than minutes, set maxsplit to minutes
      if (minutes < maxRecommendedTimeSplit) {
        maxRecommendedTimeSplit = minutes;
      }

      // inform instructor that timesplit is too long
      if (duration > maxRecommendedTimeSplit) {
        setTimeout(() => {
          window.alert("Time Split value is too large. Lower your time split");
        }, 10);
      }
    }
    setDuration(duration);
  };

  useEffect(() => {
    setDuration(duration);
  }, [duration]);

  // update setLocationChecker when selectedProgramData physical location or virtual link is
  useEffect(() => {
    if (
      (physical_location && physical_location !== "") ||
      (virtual_link && virtual_link !== "")
    ) {
      setLocationChecker(true); // if physical_location or virtual link valid, set to true
    } else {
      setLocationChecker(false);
    }
  }, [physical_location, virtual_link]);

  // update setEnableDurationAndDates when locationChecker and timeChecker are updated
  useEffect(() => {
    if (locationChecker) {
      setEnableDurationAndDates(true);
    } else {
      setEnableDurationAndDates(false);
    }
  }, [locationChecker]);

  return (
    <div className="fixed top-1/2 left-1/2 w-1/3 transform -translate-x-1/2 -translate-y-1/2 bg-calendar-popup-gray border border-gray-300 shadow-md pb-7 relative">
      <button
        className="absolute top-1 right-1 cursor-pointer fas fa-times"
        onClick={onClose}
      ></button>
      <div className="w-11/12 m-auto font-body">
        <div id="calendar-container" className="">
          <div className="flex flex-col items-center">
            <h2 className="font-bold pt-5">
              Enter Dates Along With Their Times
            </h2>
            <Calendar
              onChange={handleCalendarChange}
              value={date}
              minDate={new Date()} // disables past dates from being selected
            />
            <br />
            {showTimePicker && (
              <div className="flex flex-col items-center py-5">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <SingleInputTimeRangeField
                    label="Set Time"
                    value={[timeBlock.start_time, timeBlock.end_time]}
                    onChange={(e) => handleTimeChange(e)}
                    onBlur={() => handleShowDuration(timeRange)}
                  />
                </LocalizationProvider>
              </div>
            )}
          </div>
        </div>
        {showDuration && (
          <div className="flex flex-row items-center mt-4">
            <label className="whitespace-nowrap font-bold text-xl">
              Define Meeting Duration?
            </label>
            <input
              type="checkbox"
              id="myCheckbox"
              class="form-checkbox h-6 w-7 text-blue-600 ml-2 mt-1"
              checked={boxShown}
              onChange={showBox}
              disabled={!enableDurationAndDates}
            ></input>
            {boxShown && (
              <div className="flex items-end">
                <input
                  className="border border-light-gray ml-3 mt-1 w-20 hover:bg-gray"
                  name="duration"
                  value={local_duration}
                  onChange={(event) => {
                    const inputValue = event.target.value;
                    const numericValue = inputValue.replace(/[^0-9]/g, "a"); // Remove non-numeric characters
                    handleDurationChange(numericValue);
                  }}
                />
                <label className="whitespace-nowrap font-bold text-sm ml-1">
                  minutes
                </label>
              </div>
            )}
            <button
              className={`ms-auto font-bold border border-light-gray rounded-md shadow-md text-sm px-2 py-2 ${
                !enableDurationAndDates ? "opacity-50" : ""
              }`}
              onClick={createTimeSlot}
              disabled={!enableDurationAndDates}
            >
              Create
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
