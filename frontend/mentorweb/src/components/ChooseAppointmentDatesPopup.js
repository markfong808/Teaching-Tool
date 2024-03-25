/* ChooseAppointmentDatesPopup.js
 * Last Edited: 3/24/24
 *
 * UI popup shown when Instructor clicks on choose meeting dates button
 * in the "Programs" tab. Allows teacher to set availabilities
 * based on what days times they have scheduled for program already
 *
 * Known Bugs:
 *  -
 *
 */
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { getCookie } from "../utils/GetCookie";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "@wojtekmaj/react-timerange-picker/dist/TimeRangePicker.css";
import { addDays } from "date-fns";

const ChooseAppointmentDatesPopup = ({
  onClose,
  data,
  id,
  duration,
  physical_location,
  meeting_url,
  program_id,
  program_name,
  isDropins,
}) => {
  // Calendar Data Variables
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [weeklyTimes, setWeeklyTimes] = useState([]);

  // Load Variables
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dateSelected, setDateSelected] = useState(false);

  // Course Variables
  const [course_id, setCourseId] = useState();

  ////////////////////////////////////////////////////////
  //               Fetch Post Functions                 //
  ////////////////////////////////////////////////////////

  // posts added availbility data to the Availability table
  const createTimeSlot = async () => {
    try {
      const csrfToken = getCookie("csrf_access_token");
      let convertedAvailability = [];

      // iterate from the start date till the end date
      for (
        let date = new Date(startDate);
        date <= endDate;
        date = addDays(date, 1)
      ) {
        // obtain day of week based on date
        const dayOfWeek = format(date, "EEEE");

        // if days of week in weekly times,
        // push available time into converted availability list
        if (weeklyTimes[dayOfWeek]) {
          const { start_time, end_time } = weeklyTimes[dayOfWeek];
          const formattedDate = format(date, "yyyy-MM-dd");

          convertedAvailability.push({
            id: program_id,
            name: program_name,
            date: formattedDate,
            start_time: start_time,
            end_time: end_time,
          });
        }
      }

      // if no duration set to 0
      if (!duration || duration === "") {
        duration = 0;
      } else {
        duration = Number(duration); // set duration based on passed in duration
      }

      // create convertedAvailability object and pass to backend call
      convertedAvailability = {
        availabilities: convertedAvailability,
        duration: duration,
        physical_location: physical_location,
        meeting_url: meeting_url,
        isDropins: isDropins,
      };

      await fetch(`/instructor/availability/${encodeURIComponent(course_id)}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(convertedAvailability),
      });

      window.alert("Availabilities created successfully!");
    } catch (error) {
      console.error("Error creating availability:", error);
    }
  };

  ////////////////////////////////////////////////////////
  //                 Handler Functions                  //
  ////////////////////////////////////////////////////////

  // change start and end date to what instructor selects
  const handleCalendarChange = (event) => {
    // start end date could be one date, or range
    setStartDate(event[0]);
    setEndDate(event[1]);
    setDateSelected(true);

    // once start and end date are set, show button to create availability
    setShowTimePicker(true);
  };

  ////////////////////////////////////////////////////////
  //               UseEffect Functions                  //
  ////////////////////////////////////////////////////////

  // on page load, set weekly times that instructor has chosen
  useEffect(() => {
    setWeeklyTimes(data);
  }, [data]);

  // on page load, set course id
  useEffect(() => {
    setCourseId(id);
  }, [id]);

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  return (
    <div className="fixed top-1/2 left-1/2 w-1/3 transform -translate-x-1/2 -translate-y-1/2 bg-calendar-popup-gray border border-gray-300 shadow-md pb-7 relative">
      <button
        className="absolute top-1 right-1 cursor-pointer fas fa-times"
        onClick={onClose}
      ></button>
      <div className="flex flex-row py-5 m-auto">
        <div className="w-2/3 m-auto font-body">
          <div id="calendar-container">
            <div className="flex flex-col items-center">
              <h2 className="font-bold pt-5">Choose A Start And End Date:</h2>
              <Calendar
                onChange={handleCalendarChange}
                selectRange={true} // Enable range selection
                value={[startDate, endDate]}
                minDate={new Date()} // disables past dates from being selected
              />
              {dateSelected && (
                <>
                  <label>
                    {format(addDays(startDate, 1), "MMMM do, yyyy") +
                      " -- " +
                      format(addDays(endDate, 1), "MMMM do, yyyy")}
                  </label>
                </>
              )}
              <br />

              {showTimePicker && (
                <div className="flex flex-col py-5">
                  <button
                    className="bg-purple text-white p-2 rounded-md m-2 hover:text-gold"
                    onClick={createTimeSlot}
                  >
                    Create
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseAppointmentDatesPopup;
