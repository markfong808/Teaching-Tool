/* UserContext.js
 * Last Edited: 3/25/24
 *
 * Allows to pass down user data to a component without having
 * to pass props through every level in the component tree of Canvas Meeting Scheduler.
 *
 * Known bugs:
 * -
 *
 */

import React, { createContext, useState } from "react";

// Context Variables
export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  // User Data Variables
  const [user, setUser] = useState(null);

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
