import React, { useState } from "react";

export function Tooltip({ text, children, flip }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={`relative inline-block ${flip ? 'origin-bottom-left' : 'origin-bottom-right'}`}
      id="tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          id="tooltip"
          className={`bg-dark-gray text-white rounded-md p-2 w-[400px] absolute ${flip ? 'bottom-full right-0' : 'bottom-full left-0'} overflow-auto z-10`}
        >
          {text}
        </div>
      )}
    </div>
  );
}
