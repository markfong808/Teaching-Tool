// ProtectedRoute.js

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from './UserContext'; // Adjust the import path as necessary

const ProtectedRoute = ({ children, allowedAccountTypes }) => {
  const { user } = useContext(UserContext);

  if (!user) {
    // User not logged in
    return <Navigate to="/unauthorized" />;
  } else if (allowedAccountTypes && !allowedAccountTypes.includes(user.account_type)) {
    // User doesn't have the right account type
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
