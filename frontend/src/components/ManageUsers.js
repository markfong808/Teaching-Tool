/* ManageUsers.js
 * Last Edited: 3/26/24
 *
 * Manage Users tab where admins can see registered instructor,
 * student, and admin accounts. Admins can manage
 *
 * Known bugs:
 * -
 *
 */

import React, { useContext, useEffect, useState } from "react";
import { capitalizeFirstLetter } from "../utils/FormatDatetime";
import UserProfile from "./UserProfile";
import { UserContext } from "../context/UserContext";
import { isnt_Admin } from "../utils/checkUser";

export default function ManageUsers() {
  // General Variables
  const { user } = useContext(UserContext);

  // User Data Variables
  const [users, setUsers] = useState([]);
  const [selectedUserType, setSelectedUserType] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [query, setQuery] = useState("");

  ////////////////////////////////////////////////////////
  //               Fetch Get Functions                  //
  ////////////////////////////////////////////////////////

  // fetch all users in system
  const fetchUsers = () => {
    // user isn't an admin
    if (isnt_Admin(user)) return;

    fetch("/admin/all-users")
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to fetch users");
        }
      })
      .then((data) => {
        setUsers(data.user_list);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  };

  ////////////////////////////////////////////////////////
  //               Fetch Post Functions                 //
  ////////////////////////////////////////////////////////

  // change account type of a user
  const handleAccountTypeChange = (user_id, new_account_type, userName) => {
    // user isn't an admin
    if (isnt_Admin(user)) return;

    // warning message
    if (
      !new_account_type ||
      !window.confirm(
        `Are you sure you want to change ${userName}'s account type to ${new_account_type}?`
      )
    ) {
      return;
    }

    fetch("/admin/change-account-type", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, new_account_type }),
    })
      .then((response) => {
        if (response.ok) {
          alert("Account Type changed successfully");

          // update users variable
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === user_id
                ? { ...user, account_type: new_account_type }
                : user
            )
          );
        } else {
          alert("Error changing account type");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  // change account status of a user
  const handleAccountStatusChange = (user_id, new_account_status, userName) => {
    // user isn't an admin
    if (isnt_Admin(user)) return;

    // warning message
    if (
      !new_account_status ||
      !window.confirm(
        `Are you sure you want to change ${userName}'s account status to ${new_account_status}?`
      )
    ) {
      return;
    }

    fetch("/admin/change-account-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, new_account_status }),
    })
      .then((response) => {
        if (response.ok) {
          alert("Account Status changed successfully");

          // Update the user's account status locally
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === user_id
                ? { ...user, status: new_account_status }
                : user
            )
          );
        } else {
          alert("Error changing account status.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  ////////////////////////////////////////////////////////
  //                 Handler Functions                  //
  ////////////////////////////////////////////////////////

  // select a new user to view
  const handleUserNameClick = (user) => {
    setSelectedUser(user); // Set the selected user when name is clicked
  };

  // select a new user type for table
  const handleUserTypeChange = (event) => {
    setSelectedUserType(event.target.value);
  };

  // filter users by query
  const handleFilter = (event) => {
    setQuery(event.target.value);
  };

  // Group users by account type
  const groupUsersByAccountType = users.reduce((acc, user) => {
    const { account_type } = user;
    if (!acc[account_type]) {
      acc[account_type] = [];
    }
    acc[account_type].push(user);
    return acc;
  }, {});

  ////////////////////////////////////////////////////////
  //                 UseEffect Functions                //
  ////////////////////////////////////////////////////////

  // fetch users on page load
  useEffect(() => {
    fetchUsers();
  }, []);

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  return (
    // Container for the ManageUsers webpage
    <div className="flex flex-col w-2/3 m-auto">
      {selectedUser ? (
        // If admin clicks on user's name when looking at user accounts, call UserProfile component to see user account details
        <UserProfile
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUserUpdate={fetchUsers}
        />
      ) : (
        // Admins can choose which users to manage based on user account type
        <div className="">
          {/* Manage Users label*/}
          <h1 className="text-2xl font-bold">Manage Users</h1>
          {/* User account type selection*/}
          <select
            className="border border-light-gray"
            onChange={handleUserTypeChange}
          >
          {/* User account type options */}
            <option value="">Select User Type</option>
            {Object.keys(groupUsersByAccountType).map((account_type) => (
              <option key={account_type} value={account_type}>
                {account_type.charAt(0).toUpperCase() + account_type.slice(1)}
              </option>
            ))}
          </select>

          {/* Once admin selects user type, they can view all users of same type and edit information */}
          {selectedUserType && (
            // Input field to filter user type
            <div>
              <input
                className="border border-light-gray w-1/3 my-5"
                type="text"
                placeholder="Filter"
                onChange={handleFilter}
              />

              {/* Table to display Canvas Meeting Scheduler users */}
              <table className="border w-full">
                {/* Table headers to display user account information categories */}
                <thead className="bg-purple text-white">
                  <tr>
                    <th className="text-start border-r">ID</th>
                    <th className="text-start border-r">Name</th>
                    <th className="text-start border-r">Email</th>
                    <th className="text-start border-r">Account Type</th>
                    <th className="text-start border-r">Status</th>
                  </tr>
                </thead>

                {/* Table body to display existing Canvas Meeting Scheduler users */}
                <tbody>
                  {/* Call function to group users by selected user account type */}
                  {groupUsersByAccountType[selectedUserType]
                    .filter(
                      (user) =>
                        user.id.toString().includes(query) ||
                        user.name.toLowerCase().includes(query) ||
                        user.email.toLowerCase().includes(query) ||
                        user.account_type.toLowerCase().includes(query) ||
                        user.status.toLowerCase().includes(query)
                    )
                    .map((user) => (
                      // Table row to display user account information
                      <tr className="border-b" key={user.id}>
                        {/* Table cell to display user id */}
                        <td className="border-r w-[75px]">{user.id}</td>

                        {/* Table cell to display user name */}
                        <td
                          className="border-r text-blue underline cursor-pointer"
                          onClick={() => handleUserNameClick(user)}
                        >
                          {user.name}
                        </td>

                        {/* Table cell to display user email */}
                        <td className="border-r">{user.email}</td>

                        {/* Table cell for display and edit user account type */}
                        <td className="border-r w-[125px]">
                          <div>
                            <select
                              onChange={(e) =>
                                handleAccountTypeChange(
                                  user.id,
                                  e.target.value,
                                  user.name
                                )
                              }
                            >
                              {/* Account type options: Admin, Instructor, or student  */}
                              <option value="">
                                {capitalizeFirstLetter(user.account_type)}
                              </option>
                              <option value="admin">Admin</option>
                              <option value="instructor">Instructor</option>
                              <option value="student">Student</option>
                            </select>
                          </div>
                        </td>

                        {/* Table Cell to display and edit user account status */}
                        <td className="border-r w-[125px]">
                          <div>
                            {/* Account status selection */}
                            <select
                              onChange={(e) =>
                                handleAccountStatusChange(
                                  user.id,
                                  e.target.value,
                                  user.name
                                )
                              }
                            >
                            {/* Account status options: Active or Inactive */}
                              <option value="">
                                {capitalizeFirstLetter(user.status)}
                              </option>
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
