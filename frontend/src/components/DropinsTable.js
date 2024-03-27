/* DropinsTable.js
 * Last Edited: 3/24/24
 *
 * Table that shows student Drop-In times
 * for their courses inside "Courses" tab
 *
 * Known Bugs:
 * -
 *
 */

import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import {
  formatTime,
  formatDate,
  getDayFromDate,
} from "../utils/FormatDatetime";
import { isnt_Student } from "../utils/checkUser";

export default function DropinsTable({ courseId, courseName }) {
  // General Variables
  const { user } = useContext(UserContext);

  // Drop-In Table Variables
  const [dropinAvailabilties, setDropinAvailabilties] = useState([]);
  const [showTable, setShowTable] = useState(true);
  const [sortedBy, sortBy] = useState("Name");
  const [hoveringDateOrTime, setHoveringDateOrTime] = useState(false);

  ////////////////////////////////////////////////////////
  //               Fetch Get Functions                  //
  ////////////////////////////////////////////////////////

  // fetch dropin availabilities for student
  const fetchDropins = async () => {
    // user isn't an student
    if (isnt_Student(user)) return;

    try {
      const response = await fetch(
        `/course/programs/dropins/${encodeURIComponent(courseId)}`,
        {
          credentials: "include",
        }
      );

      const fetchedData = await response.json();

      // sort based on Date
      const sortedData = (fetchedData || []).sort((a, b) => {
        const dateComparison = new Date(a.date) - new Date(b.date);
        // if the date is the same, sort based on start time
        if (dateComparison === 0) {
          return (
            new Date(`${a.date}T${a.start_time}`) -
            new Date(`${b.date}T${b.start_time}`)
          );
        }
        return dateComparison;
      });
      // set data based on sorted dates for drop-ins
      setDropinAvailabilties(sortedData);
    } catch (error) {
      console.error("Error fetching drop-ins data:", error);
    }
  };

  ////////////////////////////////////////////////////////
  //               Handler Functions                    //
  ////////////////////////////////////////////////////////

  // sort drop ins
  const sortTable = (sort) => {
    const daysOfWeekOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ];

    // iterate through data array and sort
    const sortedData = [...dropinAvailabilties].sort((a, b) => {
      switch (sort) {
        // sort based on name
        case "Name":
          return a.name.localeCompare(b.name);
        // sort based on day
        case "Day":
          return (
            daysOfWeekOrder.indexOf(getDayFromDate(a.date)) -
            daysOfWeekOrder.indexOf(getDayFromDate(b.date))
          );
        // sort based on Date
        case "Date":
          const dateComparison = new Date(a.date) - new Date(b.date);
          if (dateComparison === 0) {
            return (
              new Date(`${a.date}T${a.start_time}`) -
              new Date(`${b.date}T${b.start_time}`)
            );
          }
          return dateComparison;
        // sort based on status
        case "Status":
          return a.status.localeCompare(b.status);
        // sort doesn't match any of the case statements above
        default:
          return 0;
      }
    });

    // set data to the sortedData
    setDropinAvailabilties(sortedData);
  };

  ////////////////////////////////////////////////////////
  //               UseEffect Functions                  //
  ////////////////////////////////////////////////////////

  // fetch drop ins when the course id is updated and valid
  useEffect(() => {
    if (courseId && courseId !== "") {
      fetchDropins();
    } else {
      setDropinAvailabilties([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // sortTable function called when sortedBy is updated
  useEffect(() => {
    sortTable(sortedBy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedBy]);

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  return (
    // Define Drop-Ins Table component 
    <div className="flex flex-col w-full m-auto items-center">
      {/* Course Drop-Ins header or if no Course selected, inform student to select a Course */}
      <div className="text-center font-bold text-2xl pb-5">
        <h1>{courseName ? `${courseName} Drop-Ins` : "Select A Course"}</h1>
      </div>

      {/* Show table button that lets students show or hide Drop-Ins table */}
      <button
        className="font-bold border border-light-gray rounded-md shadow-md text-sm px-3 py-1 mb-2 place-self-end"
        onClick={() => setShowTable(!showTable)}
      >
        {showTable ? "Hide Table" : "Show Table"}
      </button>

      {/* Table to display Drop-Ins */}
      <div id="table" className="w-11/12">
        <table className="w-full border text-center">
          {dropinAvailabilties.length > 0 ? (
            <>
             {/* Table headers to display Drop-In information categories and allow sorting */}
              <thead className="border-b border-light-gray bg-purple text-white">
                {/* Name header */}
                <th
                  className="border-r border-light-gray w-14% cursor-pointer hover:bg-gold"
                  onClick={() => sortBy("Name")}
                >
                  Name
                </th>

                {/* Day header */}
                <th
                  className="border-r border-light-gray w-8% cursor-pointer hover:bg-gold"
                  onClick={() => sortBy("Day")}
                >
                  Day
                </th>

                {/* Date header */}
                <th
                  className={`border-r border-light-gray w-12% cursor-pointer ${
                    hoveringDateOrTime ? "bg-gold" : ""
                  }`}
                  onClick={() => sortBy("Date")}
                  onMouseEnter={() => setHoveringDateOrTime(true)}
                  onMouseLeave={() => setHoveringDateOrTime(false)}
                >
                  Date
                </th>

                {/* Time header */}
                <th
                  className={`border-r border-light-gray w-12% cursor-pointer ${
                    hoveringDateOrTime ? "bg-gold" : ""
                  }`}
                  onClick={() => sortBy("Date")}
                  onMouseEnter={() => setHoveringDateOrTime(true)}
                  onMouseLeave={() => setHoveringDateOrTime(false)}
                >
                  Time (PST)
                </th>
              </thead>

              {/* Table body to display existing Drop-Ins */}
              <tbody>
                {showTable &&
                  dropinAvailabilties.map((availability) => (
                    // Table row to map each row to a Drop-In
                    <tr className="border" key={availability.id}>

                      {/* Table cell to display Drop-In Program name */}
                      <td className="border-r">{availability.name}</td>

                      {/* Table cell to display Drop-In day */}
                      <td className="border-r">
                        {getDayFromDate(availability.date)}
                      </td>

                      {/* Table cell to display Drop-In date */}
                      <td className="border-r">
                        {formatDate(availability.date)}
                      </td>

                      {/* Table cell to display Drop-In start and end time */}
                      <td className="border-r">
                        {formatTime(availability.start_time)} -{" "}
                        {formatTime(availability.end_time)}{" "}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </>
          ) : (
              /* Show graphic to student if no Drop-Ins Available */
            <tbody>
              <tr>
                <td colSpan="5">
                  <div>
                    <img
                      src="https://assets.calendly.com/assets/frontend/media/no-events-2ed89b6c6379caebda4e.svg"
                      alt="No appointments"
                      className="m-auto"
                    />
                    <h2 className="text-center">No drop-ins available</h2>
                  </div>
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
