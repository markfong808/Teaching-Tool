/* Profile.js
 * Last Edited: 3/26/24
 *
 * Profile Tab for Student and Instructor account_types.
 * The Profile tab has account_type-based layouts for the
 * information for the user
 *
 * Known bugs:
 * - personal meeting url needs to be implemented and work with programs
 *
 */

import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { capitalizeFirstLetter } from "../utils/FormatDatetime";
import { getCookie } from "../utils/GetCookie";
import { Tooltip } from "../components/Tooltip";
import { isnt_User } from "../utils/CheckUser";

export default function Profile() {
  // General Variables
  const csrfToken = getCookie("csrf_access_token");
  const { user } = useContext(UserContext);

  // Load Variables
  const [showPronounInputField, setShowPronounInputField] = useState(false);

  // Profile Data Variables
  const [profileData, setProfileData] = useState({}); // backup data/database-specific data
  const [formData, setFormData] = useState({}); // user input-based data
  const [pronounsType, setPronounsType] = useState("");
  const [pronounsUserInput, setPronounsUserInput] = useState("");

  ////////////////////////////////////////////////////////
  //               Fetch Get Functions                  //
  ////////////////////////////////////////////////////////

  // fetch the profile data for a user
  const fetchProfileData = async () => {
    // if not a user
    if (isnt_User(user)) return;

    try {
      const response = await fetch(
        `/user/profile/${encodeURIComponent(user.id)}`,
        {
          credentials: "include",
        }
      );

      const fetchedProfileData = await response.json();

      // set profileData to their profile data
      setProfileData(fetchedProfileData);

      // set formData to their profile data
      setFormData(fetchedProfileData);
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  ////////////////////////////////////////////////////////
  //               Fetch Post Functions                 //
  ////////////////////////////////////////////////////////

  // posts the profile data to the User Table
  const handleSaveChanges = async () => {
    // if not a user
    if (isnt_User(user)) return;

    try {
      const response = await fetch("/user/profile", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(formData),
      });

      const updatedUser = await response.json();

      // Update the user context with the new data
      setProfileData(updatedUser);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  ////////////////////////////////////////////////////////
  //                 Handler Functions                  //
  ////////////////////////////////////////////////////////

  // change formData to what user types
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // if pronouns is selected
    if (name === "pronouns") {
      // if no value, return
      if (
        value === "Undefined" ||
        (pronounsType === "Other" && (value === "" || !value))
      ) {
        return;
      }

      // if value is Other, set type to "Other"
      // called when using dropdown options
      if (value === "Other") {
        setPronounsType("Other");
        return;
      }
    }

    // set formData index(name) to value
    setFormData({ ...formData, [name]: value });
  };

  ////////////////////////////////////////////////////////
  //               UseEffect Functions                  //
  ////////////////////////////////////////////////////////

  // on page load, fetch the user's profile data
  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // show input field if user selects "Other" in pronouns dropdown menu
  useEffect(() => {
    if (pronounsType === "Other") {
      setShowPronounInputField(true);
    } else {
      setShowPronounInputField(false);
    }
  }, [pronounsType]);

  // reset temp variables when formData.pronouns is updated
  useEffect(() => {
    if (
      ["Undefined", "He/Him", "She/Her", "They/Them"].includes(
        formData.pronouns
      )
    ) {
      setPronounsType(formData.pronouns);
      setPronounsUserInput("");
    } else {
      setPronounsType("Other");
      setPronounsUserInput(formData.pronouns);
    }
  }, [formData.pronouns]);

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  if (!user) {
    return <div>Loading user data...</div>;
  }

  // HTML for webpage
  return (
    // Container for Profile webpage
    <div className="flex flex-col w-2/3 m-auto mt-8">
      {/* Define box for Account Settings */}
      <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md">
        {/* Heading inside Account Settings box */}
        <h2 className="pb-10 text-center font-bold text-2xl">
          Account Settings
        </h2>
        {/* Name label and input field for students and instructors to view and edit */}
        <div className="flex flex-col">
          <div>
            <label className="font-bold">Name &nbsp;</label>
            <Tooltip text="Alias users will see you as (Title + Name). Enter name you want to be seen as (First Name + Last Name, First Name only, Last Name only)">
              <span>ⓘ</span>
            </Tooltip>
          </div>
          <input
            className="border border-light-gray mb-3"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            onBlur={handleSaveChanges}
          />

          {/* Pronouns selection for student and instructors */}
          <div>
            <label className="font-bold inline-block">Pronouns</label>
            <select
              className="border border-light-gray rounded ml-2 hover:cursor-pointer"
              name="pronouns"
              value={pronounsType}
              onChange={handleInputChange}
              onBlur={handleSaveChanges}
            >
              <option key="Undefined" value="Undefined">
                Select...
              </option>
              <option key="He/Him" value="He/Him">
                {" "}
                He/Him
              </option>
              <option key="She/Her" value="She/Her">
                She/Her
              </option>
              <option key="They/Them" value="They/Them">
                They/Them
              </option>
              <option key="Other" value="Other">
                Other
              </option>
            </select>
            {showPronounInputField && (
              <input
                className="border border-light-gray ml-2 mt-1"
                name="pronouns"
                value={pronounsUserInput}
                onChange={(e) =>
                  handleInputChange({
                    target: { name: "pronouns", value: e.target.value },
                  })
                }
                onBlur={handleSaveChanges}
              />
            )}
          </div>

          {/* Title selection only for instructors  */}
          {profileData.account_type === "instructor" && (
            <div className="mt-3 mb-3">
              <label className="font-bold inline-block">Title</label>
              <select
                className="border border-light-gray rounded ml-2"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                onBlur={handleSaveChanges}
              >
                <option key={-1} value="">
                  No Title...
                </option>
                <option key={"Prof."} value="Prof.">
                  Prof.
                </option>
                <option key={"Dr."} value="Dr.">
                  Dr.
                </option>
                <option key={"Mr."} value="Mr.">
                  Mr.
                </option>
                <option key={"Mrs."} value="Mrs.">
                  Mrs.
                </option>
                <option key={"Ms."} value="Ms.">
                  Ms.
                </option>
              </select>
            </div>
          )}

          {/* Email label and input field that shows student and instructor email */}
          <label className="font-bold">Email</label>
          <input
            className="bg-gray border border-light-gray mb-3"
            name="email"
            value={formData.email}
            disabled
          />

          {/* Discord label and input field that shows student and instructor Discord ID and allows changes */}
          <label className="font-bold">Discord ID</label>
          <input
            className=" border border-light-gray mb-3"
            name="discord_id"
            value={formData.discord_id}
            onChange={handleInputChange}
            onBlur={handleSaveChanges}
          />

          {/* Account Type label and input field that shows student and instructor Account Type */}
          <label className="font-bold">Account Type</label>
          <input
            className="bg-gray border border-light-gray mb-3"
            name="type"
            value={capitalizeFirstLetter(profileData.account_type)}
            disabled
          />

          {/* Personal Meeting URL for instructors to enter inside input field */}
          {/* NEEDS TO BE IMPLEMENTED FOR PROGRAMS */}
          {profileData.account_type === "instructor" && (
            <div className="flex flex-col">
              <div>
                <label className="font-bold">
                  Your Personal Meeting URL&nbsp;
                </label>
                <Tooltip text="Please provide only one URL of your choice - Zoom, Teams, etc.">
                  <span>ⓘ</span>
                </Tooltip>
              </div>

              <input
                className="border border-light-gray"
                type="text"
                name="meeting_url"
                value={formData.meeting_url}
                onChange={handleInputChange}
                onBlur={handleSaveChanges}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
