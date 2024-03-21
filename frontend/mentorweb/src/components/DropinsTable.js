/* DropinsTable.js
 * Last Edited: 3/11/24
 *
 * Table that shows student Drop-In times that instructors
 * have created for their class inside "Courses" tab
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

export default function DropinsTable({ courseId, courseName }) {
  // General Variables
  const { user } = useContext(UserContext);

  // Drop-In Table Variables
  const [data, setData] = useState([]);
  const [showTable, setShowTable] = useState(true);
  const [sortedBy, sortBy] = useState("Type");
  const [hoveringDateOrTime, setHoveringDateOrTime] = useState(false);

  ////////////////////////////////////////////////////////
  //               Fetch Get Functions                  //
  ////////////////////////////////////////////////////////

  // fetch drop ins' data for a student
  const fetchDropins = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `/student/dropins/${encodeURIComponent(courseId)}`,
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
      setData(sortedData);
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
    const sortedData = [...data].sort((a, b) => {
      switch (sort) {
        // sort based on type
        case "Type":
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

  // fetch drop ins when the course id is updated and valid
  useEffect(() => {
    if (courseId && courseId !== "") {
      fetchDropins();
    } else {
      setData([]);
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
        <h1>{courseName ? `${courseName} Drop-Ins` : "Select A Course"}</h1>
      </div>
      <button
        className="font-bold border border-light-gray rounded-md shadow-md text-sm px-3 py-1 mb-2 place-self-end"
        onClick={() => setShowTable(!showTable)}
      >
        {showTable ? "Hide Table" : "Show Table"}
      </button>

      <div id="table" className="w-11/12">
        <table className="w-full border text-center">
          {data.length > 0 ? (
            <>
              <thead className="border-b border-light-gray bg-purple text-white">
                <th
                  className="border-r border-light-gray w-14% cursor-pointer hover:bg-gold"
                  onClick={() => sortBy("Type")}
                >
                  Type
                </th>
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
              </thead>
              <tbody>
                {showTable &&
                  data.map((availability) => (
                    <tr className="border" key={availability.id}>
                      <td className="border-r">{availability.type}</td>
                      <td className="border-r">
                        {getDayFromDate(availability.date)}
                      </td>
                      <td className="border-r">
                        {formatDate(availability.date)}
                      </td>
                      <td className="border-r">
                        {formatTime(availability.start_time)} -{" "}
                        {formatTime(availability.end_time)}{" "}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </>
          ) : (
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
