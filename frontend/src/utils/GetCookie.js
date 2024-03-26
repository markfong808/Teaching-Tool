/* GetCookie.js
 * Last Edited: 3/25/24
 *
 * Helper file that has function which parses csrf_access_token and returns cookie.
 *
 * Known bugs:
 * -
 *
 */

////////////////////////////////////////////////////////
//                 Handler Functions                  //
////////////////////////////////////////////////////////

//
export function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
