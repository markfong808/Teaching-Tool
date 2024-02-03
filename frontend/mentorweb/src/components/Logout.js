import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext"; 

const Logout = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext); 

  useEffect(() => {
    // Function to handle the logout process
    const handleLogout = () => {
      fetch('/logout', {
        method: 'POST',
        credentials: 'include', // Necessary to include the HTTP-only cookies
      })
      .then(response => {
        if (response.ok) {
          setUser(null);
          navigate("/");
        } else {
          console.error('Logout failed');
        }
      })
      .catch(error => {
        console.error('Network error', error);
      });
    };

    // Call the handleLogout function immediately on component mount
    handleLogout();
  }, [navigate, setUser]);  // Dependencies for useEffect

  return <div>Logging out...</div>;
};

export default Logout;
