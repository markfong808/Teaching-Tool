/* ManageAvailabilityTable.js
 * Last Edited: 3/24/24
 *
 * Table that shows instructor their global program availabilities
 * and course specific program availabilities in the "Manage Times" tab.
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
  capitalizeFirstLetter,
} from "../utils/FormatDatetime";
import { getCookie } from "../utils/GetCookie";
import { isnt_Instructor } from "../utils/CheckUser";

export default function ManageAvailabilityTable({ courseId }) {
  // General Variables
  const { user } = useContext(UserContext);
  const csrfToken = getCookie("csrf_access_token");

  // Availability Table Variables
  const [data, setData] = useState([]);
  const [showTable, setShowTable] = useState(true);
  const [sortedBy, sortBy] = useState("Name");
  const [hoveringDateOrTime, setHoveringDateOrTime] = useState(false);

  ////////////////////////////////////////////////////////
  //               Fetch Get Functions                  //
  ////////////////////////////////////////////////////////

  // fetch availability data of instructor
  const fetchAvailability = async () => {
    // user isn't an instructor
    if (isnt_Instructor(user)) return;

    try {
      const response = await fetch(
        `/instructor/availability/${encodeURIComponent(courseId)}`,
        {
          credentials: "include",
        }
      );

      const fetchedData = await response.json();

      // sort instructor availability based on name
      const sortedData = (fetchedData["instructor_availability"] || []).sort(
        (a, b) => {
          return a.name.localeCompare(b.name);
        }
      );

      // set data to sorted instructor availability data
      setData(sortedData);
    } catch (error) {
      console.error("Error fetching availability data:", error);
    }
  };

  ////////////////////////////////////////////////////////
  //               Fetch Post Functions                 //
  ////////////////////////////////////////////////////////

  // post status change of availability to Availability and Appointment tables
  const handleAvailabilityStatusChange = async (availabilityId, newStatus) => {
    // user isn't an instructor
    if (isnt_Instructor(user)) return;

    const payload = {
      availability_id: availabilityId,
      status: newStatus,
    };

    try {
      const response = await fetch("/instructor/availability/status", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 409) {
          // let user know they need to fix meeting limits
          response.json().then((data) => {
            alert(
              `${data.error}. Please update your limits the program attached to the availability.`
            );
          });
        } else {
          throw new Error("Error changing program status");
        }
      } else {
        alert("Status changed successfully");
        fetchAvailability(); // re-fetch availabilities after succcessful status change
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // post deletion of availability to Availability table
  const handleDeleteAvailability = async (availabilityId) => {
    // user isn't an instructor
    if (isnt_Instructor(user)) return;

    if (window.confirm("Are your sure you want to delete this availability?")) {
      const deleteEndpoint = `/instructor/availability/${availabilityId}/delete`;

      try {
        const response = await fetch(deleteEndpoint, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": csrfToken,
          },
        });

        if (response.ok) {
          alert("Availability deleted successfully!");
          fetchAvailability(); // re-fetch availabilities after succcessful deletion
        } else {
          throw new Error("Error deleting availability");
        }
      } catch (error) {
        console.error("Error deleting availability:", error);
      }
    }
  };

  ////////////////////////////////////////////////////////
  //               Handler Functions                    //
  ////////////////////////////////////////////////////////

  // sort availabilites by name, day, date, drop-ins, or status
  const sortTable = (sort) => {
    const daysOfWeekOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ];

    // iterate through data array and sort
    const sortedData = [...data].sort((a, b) => {
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
        // sort based on drop-ins
        case "Dropins":
          return a.isDropins.toString().localeCompare(b.isDropins.toString());
        // sort based on status
        case "Status":
          return a.status.localeCompare(b.status);
        // sort doesn't match any of the case statements above
        default:
          return 0;
      }
    });

    // setData to the sortedData
    setData(sortedData);
  };

  ////////////////////////////////////////////////////////
  //               UseEffect Functions                  //
  ////////////////////////////////////////////////////////

  // Fetch availability when courseId is valid
  useEffect(() => {
    if (courseId !== null || courseId !== "") {
      fetchAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, user]);

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
    // Define ManageAvailabilityTable component
    <div className="flex flex-col w-full m-auto items-center">
      {/* Manage Availability header */}
      <div className="text-center font-bold text-2xl pb-5">
        <h1>Manage Availability</h1>
      </div>

      {/* Show table button that lets instructors show or hide Availabilities table */}
      <button
        className="font-bold border border-light-gray rounded-md shadow-md text-sm px-3 py-1 mb-2 place-self-end"
        onClick={() => setShowTable(!showTable)}
      >
        {showTable ? "Hide Table" : "Show Table"}
      </button>

      {/* Table to display Availabilities */}
      <div className="w-11/12">
        <table className="w-full border text-center">
          {/* Table headers to display Availability information categories and allow sorting */}
          <thead className="border-b border-light-gray bg-purple text-white">
            {/* Program Name header */}
            <th
              className="border-r border-light-gray w-14% cursor-pointer hover:bg-gold"
              onClick={() => sortBy("Name")}
            >
              Program Name
            </th>

            {/* Course Name header only shown if Course is associated with Availability */}
            {courseId !== -1 && (
              <th className="border-r border-light-gray w-14%">Course Name</th>
            )}

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

            {/* Drop-Ins? header */}
            <th
              className="border-r border-light-gray w-6% cursor-pointer hover:bg-gold"
              onClick={() => sortBy("Dropins")}
            >
              Drop-Ins?
            </th>

            {/* Status header */}
            <th
              className="border-r border-light-gray w-6% cursor-pointer hover:bg-gold"
              onClick={() => sortBy("Status")}
            >
              Status
            </th>

            {/* Delete? header */}
            <th className="w-6%">Delete?</th>
          </thead>

          {/* Table body to display Availabilities */}
          <tbody>
            {/* If instructor has show table button, show Availabilities created */}
            {showTable &&
              data.map((availability) => (
                <tr className="border" key={availability.id}>
                  {/* Table cell to display Program name associated with Availability */}
                  <td className="border-r">{availability.name}</td>

                  {courseId !== -1 && (
                    // Display Course name if there's a course associated with Availability
                    <td className="border-r">
                      {availability.course_name
                        ? availability.course_name
                        : "-------"}
                    </td>
                  )}

                  {/* Table cell to display Availability Day */}
                  <td className="border-r">
                    {getDayFromDate(availability.date)}
                  </td>

                  {/* Table cell to display Availability date */}
                  <td className="border-r">{formatDate(availability.date)}</td>

                  {/* Table cell to display Availability start time and end time */}
                  <td className="border-r">
                    {formatTime(availability.start_time)} -{" "}
                    {formatTime(availability.end_time)}{" "}
                  </td>

                  {/* Table cell to display if Availability is Drop-Ins */}
                  <td className="border-r">
                    {availability.isDropins ? "Yes" : "No"}
                  </td>

                  {/* Table cell to display Availability status */}
                  <td className="border-r">
                    {/* Availability status selection allows instructors to change Availability status from active to inactive and vice versa */}
                    <select
                      onChange={(e) =>
                        handleAvailabilityStatusChange(
                          availability.id,
                          e.target.value
                        )
                      }
                      className="hover:cursor-pointer hover:bg-gray"
                      value={capitalizeFirstLetter(availability.status)}
                    >
                      {/* Availability status options are active or inactive */}
                      <option value="" className="bg-white">
                        {capitalizeFirstLetter(availability.status)}
                      </option>
                      <option
                        value={
                          availability.status === "active"
                            ? "inactive"
                            : "active"
                        }
                        className="bg-white"
                      >
                        {availability.status === "active"
                          ? "Inactive"
                          : "Active"}
                      </option>
                    </select>
                  </td>

                  {/* Table cell to display delete button for an Availability if instructor wants to delete */}
                  <td className="hover:cursor-pointer hover:bg-gray">
                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteAvailability(availability.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
