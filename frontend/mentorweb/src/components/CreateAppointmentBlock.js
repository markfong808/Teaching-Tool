/* CreateAppointmentBlock.js
 * Last Edited: 3/24/24
 *
 * Popup menu to create a appointment block for a specific date
 *
 * Known Bugs:
 * -
 *
 */

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { getCookie } from "../utils/GetCookie";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "@wojtekmaj/react-timerange-picker/dist/TimeRangePicker.css";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { SingleInputTimeRangeField } from "@mui/x-date-pickers-pro/SingleInputTimeRangeField";
import dayjs from "dayjs";

export default function CreateAppointmentBlock({
  id,
  program_id,
  program_name,
  duration,
  physical_location,
  meeting_url,
  isDropins,
  onClose,
}) {
  const [date, setDate] = useState(new Date());
  const [timeRange, setTimeRange] = useState(["12:00", "12:30"]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDuration, setShowDuration] = useState(false);
  const [boxShown, setBoxShown] = useState(false);
  const [local_duration, setDuration] = useState("");
  const [timeBlock, setTimeBlock] = useState({});
  const [dateSelected, setDateSelected] = useState(false);
  const [showPopup, setShowPopup] = useState(true);

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
            name: program_name,
            date: date,
            start_time: timeRange[0],
            end_time: timeRange[1],
          },
        ],
        duration: parseInt(local_duration),
        physical_location: physical_location,
        meeting_url: meeting_url,
        isDropins: isDropins,
        program_id: program_id,
      };

      fetch(`/instructor/availability/${encodeURIComponent(id)}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(convertedAvailability),
      })
        .then((response) => {
          return response.json();
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Failed to create availability");
        });
    }

    if (
      !window.confirm(
        "Availability created successfully! Do you want to create another?"
      )
    ) {
      setShowPopup(false);
    }
  };

  const handleCalendarChange = (event) => {
    const formattedDate = format(event, "yyyy-MM-dd");
    setDate(formattedDate);
    setDateSelected(true);
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
      let maxRecommendedDuration = 1440;

      // iterate through selectedProgramTimesData
      const startDate = new Date(`1970-01-01T${timeRange[0]}`);
      const endDate = new Date(`1970-01-01T${timeRange[1]}`);

      // calculate timeDifference into minutes
      const timeDifference = endDate - startDate;
      const minutes = Math.floor(timeDifference / (1000 * 60));

      // if maxsplit larger than minutes, set maxsplit to minutes
      if (minutes < maxRecommendedDuration) {
        maxRecommendedDuration = minutes;
      }

      // inform instructor that Duration is too long
      if (duration > maxRecommendedDuration) {
        setTimeout(() => {
          window.alert("Duration value is too large. Lower your duration");
        }, 10);
      }
    }
    setDuration(duration);
  };

  useEffect(() => {
    setDuration(duration);
  }, [duration]);

  // when the availability is set, close out of CreateAppointmentBlock
  useEffect(() => {
    if (!showPopup) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPopup]);

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
              minDate={new Date()} // disables past dates from being selected
            />

            {dateSelected && <label>{format(date, "MMMM do, yyyy")}</label>}

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
              Define Appointment Duration?
            </label>
            <input
              type="checkbox"
              id="myCheckbox"
              class="form-checkbox h-6 w-7 text-blue-600 ml-2 mt-1"
              checked={boxShown}
              onChange={showBox}
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
              className={`ms-auto font-bold border border-light-gray rounded-md shadow-md text-sm px-2 py-2`}
              onClick={createTimeSlot}
            >
              Create
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
