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
    <div className="CAPY :)">
      <div className="flex flex-col items-center mt-10">
        <img
          src="https://i.etsystatic.com/42200963/r/il/944800/4767018432/il_570xN.4767018432_20kg.jpg"
          alt="capybara"
          width="300"
          height="450"
        />
        <br />

        {/* Message to Unauthorized user */}
        <div className="border p-2">
          <h1>Error 403 - You Cannot Pass This Way</h1>
          <br />
          <p>
            Mr. Bara Isn't Pleased...
            <br />
            Perhaps you have a faulty URL and you need to go back home.
          </p>
        </div>

        <br />

        <p className="flex flex-col items-center">
          <button className="font-bold border border-light-gray rounded-md shadow-md text-2xl px-3 py-2 ml-4 hover:bg-gray">
            <Link to="/">Back to Home</Link>
          </button>
          <br />
          <button className="font-bold border border-light-gray rounded-md shadow-md text-2xl px-3 py-2 ml-4 hover:bg-gray">
            <Link to="/login">Login</Link>
          </button>
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;
