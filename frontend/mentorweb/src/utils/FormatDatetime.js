/* FormatDateTime.js
 * Last Edited: 3/25/24
 *
 * Helper file that handles formatting date, time, strings,
 * and retrieving the day from a given date.
 *
 * Known Bugs:
 * -
 *
 */

////////////////////////////////////////////////////////
//                 Handler Functions                  //
////////////////////////////////////////////////////////

export function formatDate(dateString) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  };
  return new Date(dateString + "Z").toLocaleDateString(undefined, options);
}

export function formatTime(inputTime) {
  if (/\d{1,2}:\d{2}\s[APap][Mm]/.test(inputTime)) {
    return inputTime;
  }
  const [hours, minutes] = inputTime.split(":");
  const hour = parseInt(hours);
  const minute = parseInt(minutes);
  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

export function getDayFromDate(dateString) {
  const date = new Date(dateString);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getUTCDay()];
}

export function capitalizeFirstLetter(string) {
  if (typeof string !== "string") return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}
