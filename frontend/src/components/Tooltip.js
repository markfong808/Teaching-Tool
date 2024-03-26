/* Tooltip.js
 * Last Edited: 3/25/24
 *
 * Tooltip that displays additional information for the
 * instructor and student when interacting with the UI of
 * Canvas Meeting Scheduler.
 *
 * Known bugs:
 * -
 *
 */

import React, { useState } from "react";

export function Tooltip({ text, children, flip }) {
  // Load Variables
  const [isVisible, setIsVisible] = useState(false);

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  return (
    <div
      className={`relative inline-block hover:cursor-pointer ${
        flip ? "origin-bottom-left" : "origin-bottom-right"
      }`}
      id="tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          id="tooltip"
          className={`bg-dark-gray text-white rounded-md p-2 w-[400px] absolute ${
            flip ? "bottom-full right-0" : "bottom-full left-0"
          } overflow-auto z-10`}
        >
          {text}
        </div>
      )}
    </div>
  );
}
