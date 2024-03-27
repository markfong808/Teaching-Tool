/* Unauthorized.js
 * Last Edited: 3/26/24
 *
 * Message rendered for unauthorized use of Canvas Meeting Scheduler.
 * User is redirected back to the home or login page.
 *
 * Known bugs:
 * -
 *
 */

import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  return (
    // Container for Unauthorized user handling component
    <div className="ua-container">
      <div class="gandalf">
        <div class="fireball" />
        <div class="skirt" />
        <div class="sleeves" />
        <div class="shoulders">
          <div class="hand left" />
          <div class="hand right" />
        </div>
        <div class="head">
          <div class="hair" />
          <div class="beard" />
        </div>
      </div>

      {/* Message to Unauthorized user */}
      <div class="message">
        <h1>403 - You Shall Not Pass</h1>
        <p>
          Uh oh, Gandalf is blocking the way!
          <br />
          Maybe you have a typo in the url? Or you meant to go to a different
          location? Like...Hobbiton?
        </p>
      </div>

      {/* Link unauthorized user back to Home or Login Webpage */}
      <p>
        <Link to="/">Back to Home</Link>
        <br />
        <br />
        <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Unauthorized;
