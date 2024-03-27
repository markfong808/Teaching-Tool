/* ProtectedRoute.js
 * Last Edited: 3/26/24
 *
 * Wraps routes in App.js to only serve admins, students, and instructors when
 * they access webpages and their components on Canvas Meeting Scheduler.
 * If the account type isn't valid or the user isn't logged in and tries to access
 * components or webpages, redirect to the Unauthorized component.
 *
 * Known bugs:
 * -
 *
 */

import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext"; // Adjust the import path as necessary

const ProtectedRoute = ({ children, allowedAccountTypes }) => {
  // General Variables
  const { user } = useContext(UserContext);

  if (!user) {
    // User not logged in
    return <Navigate to="/unauthorized" />;
  } else if (
    allowedAccountTypes &&
    !allowedAccountTypes.includes(user.account_type)
  ) {
    // User doesn't have the right account type
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
