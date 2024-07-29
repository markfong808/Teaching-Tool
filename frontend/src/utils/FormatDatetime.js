/* FormatDateTime.js
 * Last Edited: 3/26/24
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

// convert a date string into a date object
export function formatDate(dateString) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  };
  return new Date(dateString + "Z").toLocaleDateString(undefined, options);
}

// format the time string to "hh:mm AM/PM"
export function formatTime(inputTime) {
  // Ensure inputTime is a string and has a default value if undefined
  if (typeof inputTime !== 'string') {
    console.error('Invalid inputTime:', inputTime);
    return 'Invalid time';
  }
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


// return the week day from a date object
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

// capitalize the first letter of a string
export function capitalizeFirstLetter(string) {
  if (typeof string !== "string") return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}
