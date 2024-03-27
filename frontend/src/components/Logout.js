/* Logout.js
 * Last Edited: 3/26/24
 *
 * Logout tab that handles instructor, student, and admin logout.
 *
 * Known bugs:
 * -
 *
 */

import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const Logout = () => {
  // General Variables
  const { setUser } = useContext(UserContext);

  // Webpage Navigate Variables
  const navigate = useNavigate();

  ////////////////////////////////////////////////////////
  //               Fetch Post Functions                 //
  ////////////////////////////////////////////////////////

  // Function to handle the logout process
  useEffect(() => {
    const handleLogout = () => {
      fetch("/logout", {
        method: "POST",
        credentials: "include", // Necessary to include the HTTP-only cookies
      })
        .then((response) => {
          if (response.ok) {
            setUser(null);
            navigate("/");
          } else {
            console.error("Logout failed");
          }
        })
        .catch((error) => {
          console.error("Network error", error);
        });
    };

    // Call the handleLogout function immediately on component mount
    handleLogout();
  }, [navigate, setUser]); // Dependencies for useEffect

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  // Display logging out while logging out the admin, instructor, or student
  return <div>Logging out...</div>;
};

export default Logout;
