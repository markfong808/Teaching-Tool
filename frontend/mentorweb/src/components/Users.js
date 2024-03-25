import React, { useEffect, useState } from "react";
import { capitalizeFirstLetter } from "../utils/FormatDatetime";
import UserProfile from "./UserProfile";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUserType, setSelectedUserType] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [query, setQuery] = useState("");

  const fetchUsers = () => {
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

  useEffect(() => {
    fetchUsers(); // Call fetchUsers inside useEffect
  }, []);

  const handleUserNameClick = (user) => {
    setSelectedUser(user); // Set the selected user when name is clicked
  };

  const handleAccountTypeChange = (user_id, new_account_type, userName) => {
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

  const handleAccountStatusChange = (user_id, new_account_status, userName) => {
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
          // Update the user's account status locally
          alert("Account Status changed successfully");
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

  const handleUserTypeChange = (event) => {
    setSelectedUserType(event.target.value);
  };

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

  return (
    <div className="flex flex-col w-2/3 m-auto">
      {selectedUser ? (
        <UserProfile
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUserUpdate={fetchUsers}
        />
      ) : (
        <div className="">
          <h1 className="text-2xl font-bold">Manage Users</h1>
          <select
            className="border border-light-gray"
            onChange={handleUserTypeChange}
          >
            <option value="">Select User Type</option>
            {Object.keys(groupUsersByAccountType).map((account_type) => (
              <option key={account_type} value={account_type}>
                {account_type.charAt(0).toUpperCase() + account_type.slice(1)}
              </option>
            ))}
          </select>
          {selectedUserType && (
            <div>
              <input
                className="border border-light-gray w-1/3 my-5"
                type="text"
                placeholder="Filter"
                onChange={handleFilter}
              />
              <table className="border w-full">
                <thead className="bg-purple text-white">
                  <tr>
                    <th className="text-start border-r">ID</th>
                    <th className="text-start border-r">Name</th>
                    <th className="text-start border-r">Email</th>
                    <th className="text-start border-r">Account Type</th>
                    <th className="text-start border-r">Status</th>
                  </tr>
                </thead>
                <tbody>
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
                      <tr className="border-b" key={user.id}>
                        <td className="border-r w-[75px]">{user.id}</td>
                        <td
                          className="border-r text-blue underline cursor-pointer"
                          onClick={() => handleUserNameClick(user)}
                        >
                          {user.name}
                        </td>
                        <td className="border-r">{user.email}</td>
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
                              <option value="">
                                {capitalizeFirstLetter(user.account_type)}
                              </option>
                              <option value="admin">Admin</option>
                              <option value="instructor">Instructor</option>
                              <option value="student">Student</option>
                            </select>
                          </div>
                        </td>
                        <td className="border-r w-[125px]">
                          <div>
                            <select
                              onChange={(e) =>
                                handleAccountStatusChange(
                                  user.id,
                                  e.target.value,
                                  user.name
                                )
                              }
                            >
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
