/* Signup.js
 * Last Edited: 3/24/24
 *
 * Register Tab for students, instructors to enter
 * name, email, password, password verification, and usertype
 * to use the website
 *
 * Known Bugs:
 * -
 *
 */

import React, { useState } from "react";

export default function Signup() {
  // Registration Data Variables
  const [userType, setUserType] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [registrationError, setRegistrationError] = useState("");

  ////////////////////////////////////////////////////////
  //               Fetch Post Functions                 //
  ////////////////////////////////////////////////////////

  // called when user clicks on register button
  // redirects user to the login page once registered
  const handleSubmit = async (e) => {
    // prevent submit event from happening if name, email, userType
    // password, verifyPassword, and registrationError are invalid values
    e.preventDefault();

    const formData = {
      name,
      email,
      password,
      verifyPassword,
      userType,
    };

    try {
      const response = await fetch("/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Account created successfully. Login to your account now!");
        window.location.href = "/login"; // Redirect to the login page
      } else {
        // Handle registration errors here
        const errorResponse = await response.json();
        setRegistrationError(errorResponse.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  return (
    <div className="m-auto w-1/4 p-5 shadow-lg border border-light-gray rounded-md mt-8">
      <div className="text-center pb-5">
        <h1 className="text-xl">Register</h1>
      </div>
      <div className="">
        <div className="flex flex-col border-b">
          <label>Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col border-b pt-2">
          <label>Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col border-b pt-2">
          <label>Enter Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col border-b pt-2">
          <label>Verify Password</label>
          <input
            type="password"
            id="verify-password"
            value={verifyPassword}
            onChange={(e) => setVerifyPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex pt-1">
          <label>User Type:&nbsp;</label>
          <div className="input-radio">
            <label>Student&nbsp;</label>
            <input
              className=""
              type="radio"
              id="student"
              name="userType"
              value="student"
              checked={userType === "student"}
              onChange={(e) => setUserType(e.target.value)}
              required
            />
            <label className="ml-3">Instructor&nbsp;</label>
            <input
              type="radio"
              id="instructor"
              name="userType"
              value="instructor"
              checked={userType === "instructor"}
              onChange={(e) => setUserType(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="">
          <button
            className="bg-purple text-white h-10 w-full mt-5 hover:text-gold hover:bg-purple rounded-lg"
            onClick={handleSubmit}
          >
            Register
          </button>
        </div>
        {registrationError && (
          <p className="error-message">
            <span role="img" aria-label="error-icon" style={{ color: "red" }}>
              ❌&nbsp;&nbsp;&nbsp;
            </span>
            {registrationError}
          </p>
        )}
      </div>
    </div>
  );
}
