/* AutoAcceptAppointments.js
 * Last Edited: 3/26/24
 *
 * Auto accept meeting UI for ProgramDetails.js
 *
 * Known Bugs:
 * -
 *
 */

import React from "react";

export default function AutoAcceptAppointments({
  functions,
  userInstance,
  data,
}) {
  // update data meeting limit's based on instructor entries
  const handleLimitInputChange = (e) => {
    const { name, value } = e.target;
    const intValue = parseInt(value, 10) || 0;

    let newLimitData = {
      ...data,
      [name]: intValue,
    };

    // Ensure daily limit doesn't exceed weekly or total limit
    if (name === "max_daily_meetings") {
      if (intValue > newLimitData.max_weekly_meetings) {
        newLimitData.max_weekly_meetings = intValue;
      }
      if (intValue > newLimitData.max_monthly_meetings) {
        newLimitData.max_monthly_meetings = intValue;
      }
    }

    // Ensure weekly limit is between daily limit and total limit
    if (name === "max_weekly_meetings") {
      if (intValue < newLimitData.max_daily_meetings) {
        newLimitData.max_daily_meetings = intValue;
      }
      if (intValue > newLimitData.max_monthly_meetings) {
        newLimitData.max_monthly_meetings = intValue;
      }
    }

    // Ensure total limit isn't less than daily or weekly limit
    if (name === "max_monthly_meetings") {
      if (intValue < newLimitData.max_daily_meetings) {
        newLimitData.max_daily_meetings = intValue;
      }
      if (intValue < newLimitData.max_weekly_meetings) {
        newLimitData.max_weekly_meetings = intValue;
      }
    }

    // update selectedProgramData with new max daily, weekly, and montly meeting numbers
    functions.setSelectedProgramData(newLimitData);
  };

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  return (
    <div className="flex flex-row p-4 border border-light-gray rounded-md shadow-md m-auto mt-5">
      {userInstance?.account_type === "instructor" && (
        <div className="w-1/2">
          <label className="font-bold text-lg">
            Auto-Accept Appointment Requests?
          </label>
          <br />
          <label className="ml-2">
            Yes
            <input
              className="mb-3 ml-1"
              type="radio"
              name="auto_approve_appointments"
              value="true"
              checked={data.auto_approve_appointments === true}
              onChange={functions.handleInputChange}
              onBlur={functions.saveChangeFunction}
            />
          </label>
          &nbsp;&nbsp;
          <label>
            No
            <input
              className="ml-1"
              type="radio"
              name="auto_approve_appointments"
              value="false"
              checked={data.auto_approve_appointments === false}
              onChange={functions.handleInputChange}
              onBlur={functions.saveChangeFunction}
            />
          </label>
        </div>
      )}
      {userInstance?.account_type === "instructor" && (
        <div className="flex flex-col">
          <h2 className="font-bold text-lg">Set Appointment Limits</h2>
          <div className="flex flex-row justify-between">
            <div className="flex flex-col mr-5">
              <label>Daily Max</label>
              <input
                className="border border-light-gray w-28"
                type="number"
                name="max_daily_meetings"
                min="1"
                value={data.max_daily_meetings}
                onChange={handleLimitInputChange}
                onBlur={functions.saveChangeFunction}
              />
            </div>
            <div className="flex flex-col mr-5">
              <label>Weekly Max</label>
              <input
                className="border border-light-gray w-28"
                type="number"
                name="max_weekly_meetings"
                min="1"
                value={data.max_weekly_meetings}
                onChange={handleLimitInputChange}
                onBlur={functions.saveChangeFunction}
              />
            </div>
            <div className="flex flex-col">
              <label>Total Max</label>
              <input
                className="border border-light-gray w-28"
                type="number"
                name="max_monthly_meetings"
                min="1"
                value={data.max_monthly_meetings}
                onChange={handleLimitInputChange}
                onBlur={functions.saveChangeFunction}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
