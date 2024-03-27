/* ManagePrograms.js
 * Last Edited: 3/25/24
 *
 * Manage Programs tab in admin view that allows admins to add, delete, view,
 * and modify existing programs.
 *
 * Known bugs:
 * - get rid of save buttons like the rest of the system (make it save onBlur)
 * - not updated to work in general with the rest of the system
 *    - Doesnt load programs
 *
 */

import React, { useState, useEffect, useContext } from "react";
import { getCookie } from "../utils/GetCookie";
import { UserContext } from "../context/UserContext";
import { isnt_Admin } from "../utils/CheckUser";

const ManagePrograms = () => {
  // General Variables
  const csrfToken = getCookie("csrf_access_token");
  const { user } = useContext(UserContext);

  // Program Data Variables
  const [programs, setPrograms] = useState([]);
  const [isAddingNewProgram, setIsAddingNewProgram] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  // Form Data Variables
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
  });

  // Load Variables
  const [changesMade, setChangesMade] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  ////////////////////////////////////////////////////////
  //               Fetch Get Functions                  //
  ////////////////////////////////////////////////////////

  // fetch all programs in system
  const fetchPrograms = async () => {
    // user isn't an admin
    if (isnt_Admin(user)) return;

    setLoading(true);

    try {
      const response = await fetch("/course/programs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Include the CSRF token in the headers
          "X-CSRF-TOKEN": csrfToken,
        },
        credentials: "include", // Make sure to use credentials: 'include' for cookies
      });
      if (!response.ok) {
        throw new Error("Error fetching programs");
      }
      let data = await response.json();
      data = data.sort((a, b) => a.name.localeCompare(b.name));
      setPrograms(data);
    } catch (error) {
      setError(error.message);
    } finally {
      // success or fail, set loading to false
      setLoading(false);
    }
  };

  ////////////////////////////////////////////////////////
  //               Fetch Post Functions                 //
  ////////////////////////////////////////////////////////

  // Add a new program to the ProgramDetails Table
  const handleAddProgram = async () => {
    // user isn't an admin
    if (isnt_Admin(user)) return;

    const url = "/program";
    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsAddingNewProgram(false);
        setChangesMade(false);
        alert("Program added successfully!");
        fetchPrograms(); // Refresh programs list
      } else {
        throw new Error("Error submitting form");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Submit form for creating or updating a program
  const handleSaveChanges = async (e) => {
    // user isn't an admin or no program selected
    if (isnt_Admin(user) || !selectedProgram) return;

    const url = `/program/${selectedProgram.id}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSelectedProgram({ ...selectedProgram, ...formData });
        setChangesMade(false);
        alert("Program updated successfully!");
        fetchPrograms(); // Refresh programs list
      } else {
        throw new Error("Error submitting form");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Delete a program from the ProgramDetails Table
  const handleDelete = async (id) => {
    // user isn't an admin
    if (isnt_Admin(user)) return;

    if (window.confirm("Are you sure you want to delete this program?")) {
      try {
        const response = await fetch(`/program/${id}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "X-CSRF-TOKEN": csrfToken,
          },
        });

        if (response.ok) {
          alert("Program deleted successfully!");
          setSelectedProgram(null);
          fetchPrograms(); // Refresh programs list
        } else {
          throw new Error("Error deleting program");
        }
      } catch (error) {
        setError(error.message);
      }
    }
  };

  ////////////////////////////////////////////////////////
  //                 Handler Functions                  //
  ////////////////////////////////////////////////////////

  // handle input changes for formData
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setChangesMade(true);
  };

  // when user clicks "Add New Program", reset formData
  const handleNewProgramClick = () => {
    setIsAddingNewProgram(true);
    setSelectedProgram(null);
    setFormData({ name: "", description: "", duration: "" });
  };

  // select a new program
  const handleProgramClick = (program) => {
    setSelectedProgram(program);
  };

  // cancel formData changes
  const handleCancelChanges = () => {
    // Reset form data to initial meeting data
    setFormData({
      name: selectedProgram.name || "",
      description: selectedProgram.description || "",
      duration: selectedProgram.duration || "",
    });
    setChangesMade(false); // Reset changes made
  };

  ////////////////////////////////////////////////////////
  //                 UseEffect Functions                //
  ////////////////////////////////////////////////////////

  // when a new program is selected, update formData
  useEffect(() => {
    if (selectedProgram) {
      setFormData({
        name: selectedProgram.name || "",
        description: selectedProgram.description || "",
        duration: selectedProgram.duration || "",
      });
      setChangesMade(false);
    }
  }, [selectedProgram]);

  // Call fetchPrograms when the component mounts
  useEffect(() => {
    fetchPrograms();
  }, []);

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  if (loading) {
    // if page is loading with fetched programs, display message
    return <div>Loading...</div>;
  }

  if (error) {
    // display error message if Program can't be deleted or fetched, or form can't be submitted
    return <div>Error: {error}</div>;
  }

  // render the form for adding a new program
  const renderNewProgramForm = () => {
    if (!isAddingNewProgram) {
      return null;
    }

    const isFormComplete =
      formData.name && formData.description && formData.duration;

    // HTML for webpage
    return (
      // Define New Program Form for adding a new Program
      <div className="flex flex-col p-5 w-2/3 m-auto border border-light-gray rounded-md shadow-md">
        <div className="flex flex-row">
          {/* Add Details Here heading */}
          <h2 className="font-bold m-auto text-2xl">Add Details Here</h2>

          {/* Close button of New Program Form */}
          <div
            className="cursor-pointer"
            onClick={() => setIsAddingNewProgram(false)}
          >
            <i className="fas fa-times"></i>
          </div>
        </div>

        {/* Display Program information */}
        <div className="flex flex-col">
          {/* Name label and input field */}
          <label className="font-bold">Name</label>
          <input
            className="border border-light-gray mb-3"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />

          {/* Description label and text area */}
          <label className="font-bold">Description</label>
          <textarea
            className="border border-light-gray mb-3"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />

          {/* Duration label and input field */}
          <label className="font-bold">Duration (mins)</label>
          <input
            className="border border-light-gray mb-3 w-[100px]"
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* If admin's filled out form, they can add the new Program */}
        {isFormComplete && (
          <div className="flex justify-end">
            {/* Submit button */}
            <button
              className="bg-purple text-white p-2 rounded-md"
              onClick={handleAddProgram}
            >
              Submit
            </button>
          </div>
        )}
      </div>
    );
  };

  // render the form for editing an existing program
  const renderProgramDetails = () => {
    if (!selectedProgram) {
      return null;
    }

    // HTML for webpage
    return (
      // Define Program Form for editing
      <div className="flex flex-col w-2/3 m-auto p-5 border border-light-gray rounded-md shadow-md">
        <div className="flex flex-row">
          {/* Details heading */}
          <h2 className="font-bold text-2xl m-auto">Details</h2>

          {/* Close button of Program Details Form */}
          <div
            className="cursor-pointer"
            onClick={() => setSelectedProgram(null)}
          >
            <i className="fas fa-times"></i>
          </div>
        </div>

        {/* Admin can delete program */}
        <div className="flex justify-end">
          {/* Delete Program button */}
          <button
            className="bg-purple text-white hover:text-gold p-2 rounded-md"
            onClick={() => handleDelete(selectedProgram.id)}
          >
            Delete Program
          </button>
        </div>

        {/* Display Program information */}
        <div className="flex flex-col">
          {/* Name label and input field */}
          <label className="font-bold">Name</label>
          <input
            className="border border-light-gray mb-3"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />

          {/* Description label and text area */}
          <label className="font-bold">Description</label>
          <textarea
            className="border border-light-gray mb-3"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />

          {/* Duration label and input field */}
          <label className="font-bold">Duration (mins)</label>
          <input
            className="border border-light-gray mb-3"
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
          />
        </div>

        {/* If changes made to Program Name, Description, and Duration, admin can save or cancel changes */}
        {changesMade && (
          <div className="flex justify-end">
            {/* Save Changes button */}
            <button
              className="bg-purple text-white hover:text-gold p-2 rounded-md"
              onClick={handleSaveChanges}
            >
              Save Changes
            </button>

            {/* Cancel Changes button */}
            <button
              className="bg-purple text-white hover:text-gold p-2 ml-2 rounded-md"
              onClick={handleCancelChanges}
            >
              Cancel Changes
            </button>
          </div>
        )}
      </div>
    );
  };

  // HTML for webpage
  return (
    // Container for ManagePrograms webpage
    <div className="w-2/3 m-auto">
      {/* Call either render function based on if a Program is selected or not */}
      {selectedProgram ? renderProgramDetails() : renderNewProgramForm()}
      {/* If there's no Program selected and admin isn't adding a new Program, display table of Programs */}
      {!selectedProgram && !isAddingNewProgram && (
        <div>
          {/* Manage Programs header */}
          <h1 className="text-center text-2xl font-bold">Manage Programs</h1>

          {/* Admin can add new Program*/}
          <div className="flex justify-end my-5">
            {/* Add New Program button */}
            <button
              className="bg-purple text-white hover:text-gold p-2 rounded-md"
              onClick={handleNewProgramClick}
            >
              Add New Program
            </button>
          </div>

          {/* Table to display Programs */}
          <table className="border m-auto w-full">
            {/* Table headers to display Program information categories */}
            <thead className="bg-purple text-white">
              <tr>
                {/* Name header */}
                <th className="border-r text-start">Name</th>

                {/* Description header */}
                <th className="border-r text-start">Description</th>

                {/* Duration header */}
                <th className="border-r text-start">Duration</th>
              </tr>
            </thead>

            {/* Table body to display existing Programs */}
            <tbody>
              {programs.map((program) => (
                <tr
                  className="border-b"
                  key={program.id}
                  onClick={() => handleProgramClick(program)}
                >
                  {/* Table cell to display Program Name */}
                  <td className="border-r underline text-blue cursor-pointer">
                    {program.name}
                  </td>

                  {/* Table cell to display Program Description */}
                  <td className="border-r">{program.description}</td>

                  {/* Table cell to display Program Duration */}
                  <td className="border-r">{program.duration} mins</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManagePrograms;
