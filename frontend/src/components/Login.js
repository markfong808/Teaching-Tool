/* Login.js
 * Last Edited: 3/26/24
 *
 * Login for students, instructors, admins,
 * to enter email and password, or reset password, or create account
 *
 * Known Bugs:
 * -
 */

import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function Login() {
  // General Variables
  const { setUser } = useContext(UserContext);

  // Login Data Variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Webpage Navigate Variable
  const navigate = useNavigate();

  ////////////////////////////////////////////////////////
  //               Fetch Get Functions                  //
  ////////////////////////////////////////////////////////

  // called when attempting login into the website
  const login = async (userData) => {
    // validate if the user's email and password exist in the database
    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include", // include the HTTP-only cookies
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        setLoginError(errorResponse.error);
      }

      // fetch profile information associated with user
      const profileResponse = await fetch("/profile", {
        credentials: "include", // include the HTTP-only cookies
      });

      if (!profileResponse.ok) {
        throw new Error("Failed to retrieve user profile.");
      }

      const userProfile = await profileResponse.json();

      // set user based on user profile
      setUser(userProfile);
      navigate(`/${userProfile.account_type}`); // navigate to appropriate webpage view based on account type
    } catch (error) {}
  };

  ////////////////////////////////////////////////////////
  //                 Handler Functions                  //
  ////////////////////////////////////////////////////////

  // when user clicks submit, attempt to login user
  const handleSubmit = (e) => {
    // prevent submit event from happening if email, password, or both are invalid
    e.preventDefault();
    login({ email, password });
  };

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  return (
    <div className="flex flex-col m-auto w-1/4 p-5 border shadow-lg border-light-gray rounded-md mt-8">
      <h1 className="text-xl text-center pb-5">Login</h1>
      <form className="" onSubmit={handleSubmit}>
        <div className="flex flex-col pb-2">
          <label>Email</label>
          <input
            className="border-b"
            id="email"
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label>Password</label>
          <input
            className="border-b"
            id="password"
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="text-purple pb-5">Forgot password?</div>
          <button
            className="bg-purple text-white h-10 w-full hover:text-gold hover:bg-purple rounded-lg"
            type="submit"
          >
            Login
          </button>
          {loginError && (
            <p>
              <span role="img" aria-label="error-icon" style={{ color: "red" }}>
                ❌&nbsp;&nbsp;&nbsp;
              </span>
              {loginError}
            </p>
          )}
          <strong className="p-5 text-center">OR</strong>
          <div className="p-1 text-center">
            New user?{" "}
            <Link to="/registerform">
              <span className="text-purple hover:text-gold underline">
                Create Account
              </span>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
