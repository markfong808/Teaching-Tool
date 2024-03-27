/* Tooltip.js
 * Last Edited: 3/26/24
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
    // Define Tooltip component
    // When instructor or student hovers over Tooltip, set isVisible flag to true
    <div
      className={`relative inline-block hover:cursor-pointer ${
        flip ? "origin-bottom-left" : "origin-bottom-right"
      }`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      {/* If Tooltip visible, display text */}
      {isVisible && (
        <div
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
