/* ManageAvailability.js
 * Last Edited: 3/11/24
 *
 * Table that shows instructor their global program type availabilities
 * and course specific program type availabilities in the "Manage Times" tab.
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

export default function ManageAvailability({ courseId }) {
  // General Variables
  const { user } = useContext(UserContext);
  const csrfToken = getCookie("csrf_access_token");

  // Load Variables
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Availability Table Variables
  const [data, setData] = useState([]);
  const [showTable, setShowTable] = useState(true);
  const [sortedBy, sortBy] = useState("Type");
  const [hoveringDateOrTime, setHoveringDateOrTime] = useState(false);

  ////////////////////////////////////////////////////////
  //               Fetch Get Functions                  //
  ////////////////////////////////////////////////////////

  // fetch availability data of instructor
  const fetchAvailability = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `/mentor/availability/${encodeURIComponent(courseId)}`,
        {
          credentials: "include",
        }
      );

      const fetchedData = await response.json();

      // sort instructor availability based on type
      const sortedData = (fetchedData["instructor_availability"] || []).sort(
        (a, b) => {
          return a.type.localeCompare(b.type);
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
    const payload = {
      availability_id: availabilityId,
      status: newStatus,
    };

    try {
      const response = await fetch("/mentor/availability/status", {
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
    if (window.confirm("Are your sure you want to delete this availability?")) {
      const deleteEndpoint = `/mentor/delete-availability/${availabilityId}`;

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

  // sort availabilites
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
        // sort based on type
        case "Name":
          return a.type.localeCompare(b.type);
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

    // set data to the sortedData
    setData(sortedData);
  };

  ////////////////////////////////////////////////////////
  //               UseEffect Functions                  //
  ////////////////////////////////////////////////////////

  // on initial page load, fetchAvailability()
  useEffect(() => {
    if (!isPageLoaded) {
      fetchAvailability();
      setIsPageLoaded(!isPageLoaded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageLoaded, user]);

  // fetch availability when the course id is updated and valid
  useEffect(() => {
    if (courseId !== null || courseId !== "") {
      fetchAvailability();
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
    <div className="flex flex-col w-full m-auto items-center">
      <div className="text-center font-bold text-2xl pb-5">
        <h1>Manage Availability</h1>
      </div>
      <button
        className="font-bold border border-light-gray rounded-md shadow-md text-sm px-3 py-1 mb-2 place-self-end"
        onClick={() => setShowTable(!showTable)}
      >
        {showTable ? "Hide Table" : "Show Table"}
      </button>

      <div className="w-11/12">
        <table className="w-full border text-center">
          <thead className="border-b border-light-gray bg-purple text-white">
            <th
              className="border-r border-light-gray w-14% cursor-pointer hover:bg-gold"
              onClick={() => sortBy("Name")}
            >
              Program Name
            </th>
            {courseId !== -1 && (
              <th className="border-r border-light-gray w-14%">Course Name</th>
            )}
            <th
              className="border-r border-light-gray w-8% cursor-pointer hover:bg-gold"
              onClick={() => sortBy("Day")}
            >
              Day
            </th>
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
            <th
              className="border-r border-light-gray w-6% cursor-pointer hover:bg-gold"
              onClick={() => sortBy("Dropins")}
            >
              Drop-Ins?
            </th>
            <th
              className="border-r border-light-gray w-6% cursor-pointer hover:bg-gold"
              onClick={() => sortBy("Status")}
            >
              Status
            </th>
            <th className="w-6%">Delete?</th>
          </thead>
          <tbody>
            {showTable &&
              data.map((availability) => (
                <tr className="border" key={availability.id}>
                  <td className="border-r">{availability.type}</td>
                  {courseId !== -1 && (
                    <td className="border-r">
                      {availability.class_name
                        ? availability.class_name
                        : "-------"}
                    </td>
                  )}
                  <td className="border-r">
                    {getDayFromDate(availability.date)}
                  </td>
                  <td className="border-r">{formatDate(availability.date)}</td>
                  <td className="border-r">
                    {formatTime(availability.start_time)} -{" "}
                    {formatTime(availability.end_time)}{" "}
                  </td>
                  <td className="border-r">
                    {availability.isDropins ? "Yes" : "No"}
                  </td>
                  <td className="border-r">
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
                  <td className="hover:cursor-pointer hover:bg-gray">
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
