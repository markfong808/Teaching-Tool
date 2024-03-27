/* RegisterForm.js
 * Last Edited: 3/26/24
 *
 * Register tab of the Canvas Meeting Scheduler when user
 * visits website.
 *
 * Known bugs:
 * -
 *
 */

import Signup from "../components/Signup";

export default function RegisterForm() {
  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  return (
    // Calling child component Signup for rendering where user
    // can sign up to use Canvas Meeting Scheduler
    <div>
      <Signup />
    </div>
  );
}
