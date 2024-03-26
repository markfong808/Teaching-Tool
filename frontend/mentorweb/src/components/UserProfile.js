/* UserProfile.js
 * Last Edited: 3/25/24
 *
 * Account Details UI inside Users.js that allows admin to
 * view admin, instructor, and student account information and make changes to name.
 *
 * Known bugs:
 * -
 *
 */

import React, { useState, useEffect } from "react";
import { capitalizeFirstLetter } from "../utils/FormatDatetime";
import { getCookie } from "../utils/GetCookie";
import { Tooltip } from "./Tooltip";

export default function UserProfile({ user, onUserUpdate, onClose }) {
  // Form Data Variables
  const [formData, setFormData] = useState({
    name: user?.name || "",
  });

  // Load Variables
  const [changesMade, setChangesMade] = useState(false);

  ////////////////////////////////////////////////////////
  //               Fetch Post Functions                 //
  ////////////////////////////////////////////////////////

  //
  const handleSaveChanges = async () => {
    const updatedFormData = {
      ...(formData ? 1 : 0),
    };
    const csrfToken = getCookie("csrf_access_token");
    const userID = user.id;
    try {
      const url = `/user/profile/${userID}`;
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(updatedFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Profile update failed");
      }
      setChangesMade(false); // Reset changes made
      // Update the user context with the new data
      const updatedUser = await response.json();
      onUserUpdate(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  ////////////////////////////////////////////////////////
  //                 Handler Functions                  //
  ////////////////////////////////////////////////////////

  //
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;

    // Handle the radio button specifically
    if (type === "radio") {
      newValue = value === "true"; // Convert the value to boolean
    } else {
      // For other inputs, just use the value
      newValue = value;
    }

    setFormData({ ...formData, [name]: newValue });

    // Check if changes were made
    const formIsSameAsUser = name === "name" && value === user.name; // Use newValue for comparison

    // Set changesMade to true if form data does not match initial user data
    setChangesMade(!formIsSameAsUser);
  };

  //
  const handleCancelChanges = () => {
    // Reset form data to initial user data
    setFormData({
      name: user.name || "",
    });
    setChangesMade(false); // Reset changes made
  };

  ////////////////////////////////////////////////////////
  //                 UseEffect Functions                //
  ////////////////////////////////////////////////////////

  //
  useEffect(() => {
    // Update form data when user context updates
    if (user) {
      setFormData({
        name: user.name || "",
      });
    }
  }, [user]);

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  if (!user) {
    return <div>Loading user data...</div>;
  }
  // HTML for webpage
  return (
    <div className="flex flex-col p-5 w-2/3 m-auto border border-light-gray rounded-md shadow-md">
      <div className="flex flex-row">
        <h1 className="font-bold m-auto text-2xl">Account Details</h1>
        <div className="cursor-pointer" onClick={onClose}>
          <i className="fas fa-times"></i>
        </div>
      </div>

      <label className="font-bold">Name</label>
      <input
        className="border border-light-gray mb-3"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
      />

      <label className="font-bold">ID</label>
      <input
        className="border border-light-gray bg-gray mb-3"
        type="text"
        name="id"
        value={user.id}
        disabled
      />

      <label className="font-bold">Email</label>
      <input
        className="border border-light-gray bg-gray mb-3"
        type="text"
        name="email"
        value={user?.email}
        disabled
      />

      <label className="font-bold">Account Type</label>
      <input
        className="border border-light-gray bg-gray mb-3"
        type="text"
        name="type"
        value={capitalizeFirstLetter(user?.account_type)}
        disabled
      />

      {changesMade && (
        <div className="flex justify-end">
          <button
            className="bg-purple text-white hover:text-gold rounded-md p-2"
            onClick={handleSaveChanges}
          >
            Save Changes
          </button>
          <button
            className="bg-purple text-white hover:text-gold rounded-md p-2 ml-2"
            onClick={handleCancelChanges}
          >
            Cancel Changes
          </button>
        </div>
      )}
    </div>
  );
}
