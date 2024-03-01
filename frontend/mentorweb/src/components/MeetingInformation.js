/* MeetingInformation.js
 * Last Edited: 2/29/24
 *
 * Table UI to show appointment history for Students and Instructors
 *
 * Known bugs:
 * -
 *
 */

import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import {
  formatTime,
  formatDate,
  getDayFromDate,
  capitalizeFirstLetter,
} from "../utils/FormatDatetime.js";
import { getCookie } from "../utils/GetCookie.js";
import { Tooltip } from "../components/Tooltip.js";
import Comment from "../components/Comment.js";

export default function MeetingInformation({ courseId, reloadTable }) {
  // General Variables
  const { user } = useContext(UserContext);

  // Load Variables
  const [activeTab, setActiveTab] = useState("upcoming");
  const [changesMade, setChangesMade] = useState(false);
  const [showTable, setShowTable] = useState(true);
  const [sortedBy, sortBy] = useState("Type");
  const [hoveringDateOrTime, setHoveringDateOrTime] = useState(false);
  const [feedbackPresent, setFeedbackPresent] = useState(false);
  const [isProvidingFeedback, setIsProvidingFeedback] = useState(false);

  // Data Variables
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [typeDescriptions, setTypeDescriptions] = useState({}); // [type: string]: string
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    notes: "",
    meeting_url: "",
  });
  const [feedbackData, setFeedbackData] = useState({
    satisfaction: "",
    additional_comments: "",
  });

  ////////////////////////////////////////////////////////
  //               Fetch Get Functions                  //
  ////////////////////////////////////////////////////////

  // fetch the appointments for upcoming, pending, past tabs
  const fetchMeetings = async () => {
    if (!user) return; // If there's no user, we can't fetch appointments
    const apiEndpoint =
      user.account_type === "mentor"
        ? `/mentor/appointments`
        : `/student/appointments`;

    try {
      const response = await fetch(
        `${apiEndpoint}/${encodeURIComponent(courseId)}?type=${activeTab}`,
        {
          credentials: "include",
        }
      );
      const apiData = await response.json();
      const key =
        user.account_type === "mentor"
          ? "mentor_appointments"
          : "student_appointments";

      // Sort the appointment type
      const sortedData = (apiData[key] || []).sort((a, b) => {
        const dateComparison = new Date(a.date) - new Date(b.date);
        if (dateComparison === 0) {
          return (
            new Date(`${a.date}T${a.start_time}`) -
            new Date(`${b.date}T${b.start_time}`)
          );
        }
        return dateComparison;
      });

      setData(sortedData);
    } catch (error) {
      console.error("Error fetching data2:", error);
    }
  };

  const fetchProgramTypeDetails = async () => {
    if (!user) return; // If there's no user, we can't fetch meetings
    const apiEndpoint =
      user.account_type === "mentor"
        ? `/instructor/programs`
        : `/student/programs`;

    try {
      const response = await fetch(apiEndpoint, {
        credentials: "include",
      });
      const apiData = await response.json();
      const programDetails = apiData.map((program) => ({
        id: program.id,
        type: program.type,
        description: program.description,
      }));
      setTypeDescriptions(programDetails);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchFeedback = async () => {
    if (!selectedMeeting) return;

    try {
      const response = await fetch(
        `/feedback/${selectedMeeting.appointment_id}`,
        {
          credentials: "include",
        }
      );
      const apiData = await response.json();

      let feedbackExists = false;
      if (user.account_type === "student") {
        feedbackExists = apiData.student_rating || apiData.student_notes;
      } else if (user.account_type === "mentor") {
        feedbackExists = apiData.mentor_rating || apiData.mentor_notes;
      }

      setFeedbackPresent(feedbackExists);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  ////////////////////////////////////////////////////////
  //               Fetch Post Functions                 //
  ////////////////////////////////////////////////////////

  const handleSaveChanges = async () => {
    if (!selectedMeeting) return;

    // Get CSRF token from the cookie.
    const csrfToken = getCookie("csrf_access_token");
    const payload = {
      ...formData,
      appointment_id: selectedMeeting.appointment_id,
    };
    try {
      const response = await fetch(`/meetings/update`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Update the selected meeting with the new formData
        setSelectedMeeting({ ...selectedMeeting, ...formData });
        setChangesMade(false);
        alert("Meeting updated successfully!");
        fetchMeetings(); // Re-fetch meetings to update the list
      } else {
        throw new Error("Failed to update the meeting");
      }
    } catch (error) {
      console.error("Error updating meeting:", error);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    // Get CSRF token from the cookie.
    const csrfToken = getCookie("csrf_access_token");
    const payload = {
      appointment_id: appointmentId,
      status: newStatus,
    };
    try {
      const response = await fetch(`/meeting/update/status`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Update the selected meeting with the new formData
        setSelectedMeeting({ ...selectedMeeting, status: newStatus });
        alert("Meeting status updated successfully!");
        fetchMeetings(); // Re-fetch meetings to update
      } else {
        throw new Error("Failed to update the meeting status");
      }
    } catch (error) {
      console.error("Error updating meeting status:", error);
    }
  };

  const handleProvideFeedback = async (event) => {
    event.preventDefault();

    const csrfToken = getCookie("csrf_access_token");
    const payload = {
      ...feedbackData,
    };

    try {
      const response = await fetch(`/feedback/add`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Thank you for your feedback!");
        setIsProvidingFeedback(false);
        setChangesMade(false);
        setFeedbackData({
          satisfaction: "",
          additional_comments: "",
          appointment_id: null,
        });
        fetchMeetings();
      } else {
        throw new Error("Failed to provide feedback");
      }
    } catch (error) {
      console.error("Error providing feedback:", error);
    }
  };

  const handleCancelMeeting = async (appointmentId) => {
    if (window.confirm("Are your sure you want to cancel this meeting?")) {
      // Construct the endpoint based on account type
      const cancelEndpoint =
        user.account_type === "mentor"
          ? `/mentor/appointments/cancel/${appointmentId}`
          : `/student/appointments/cancel/${appointmentId}`;

      // Get CSRF token from the cookie. You might need a utility function to parse cookies.
      const csrfToken = getCookie("csrf_access_token");

      try {
        const response = await fetch(cancelEndpoint, {
          method: "POST",
          credentials: "include",
          headers: {
            "X-CSRF-TOKEN": csrfToken, // Include the CSRF token in the request header
          },
        });

        if (response.ok) {
          // If the cancellation was successful, update the state to reflect that
          alert("Meeting canceled successfully!");
          setActiveTab("upcoming");
          setSelectedMeeting(null); // Deselect the meeting as it is now cancelled
          fetchMeetings(); // Re-fetch meetings to update the list
        } else {
          throw new Error("Failed to cancel the meeting");
        }
      } catch (error) {
        console.error("Error cancelling meeting:", error);
      }
    }
  };

  ////////////////////////////////////////////////////////
  //                 Handler Functions                  //
  ////////////////////////////////////////////////////////

  const handleInputChange = (e) => {
    if (user.account_type !== "mentor") return;

    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setChangesMade(true);
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName); // Update the active tab state
    setSelectedMeeting(null); // Reset the selected meeting details
  };

  const handleMeetingClick = (meeting) => {
    setSelectedMeeting(meeting);
    fetchFeedback();
  };

  const handleFeedbackInputChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData({ ...feedbackData, [name]: value });
    setChangesMade(true);
  };

  const handleCancelFeedbackChanges = () => {
    setFeedbackData({
      satisfaction: "",
      additional_comments: "",
    });
    setChangesMade(false);
  };

  const handleFeedbackClick = () => {
    setIsProvidingFeedback(true);
    // Set the initial state for feedbackData including the appointment_id from the selected meeting
    setFeedbackData({
      satisfaction: "",
      additional_comments: "",
      appointment_id: selectedMeeting ? selectedMeeting.appointment_id : null,
    });
    setChangesMade(false);
  };

  const handleCancelChanges = () => {
    // Reset form data to initial meeting data
    setFormData({
      notes: selectedMeeting.notes || "",
      meeting_url: selectedMeeting.meeting_url || "",
      status: selectedMeeting.status || "",
    });
    setChangesMade(false); // Reset changes made
  };

  ////////////////////////////////////////////////////////
  //               UseEffect Functions                  //
  ////////////////////////////////////////////////////////

  useEffect(() => {
    if (selectedMeeting) {
      setFormData({
        notes: selectedMeeting.notes || "",
        meeting_url: selectedMeeting.meeting_url || "",
        status: selectedMeeting.status || "",
      });
      setChangesMade(false);
    }
  }, [selectedMeeting]);

  useEffect(() => {
    fetchMeetings();
    fetchProgramTypeDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab, reloadTable]);

  useEffect(() => {
    if (courseId !== null || courseId !== "") {
      fetchMeetings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    fetchFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMeeting]);

  useEffect(() => {
    sortTable(sortedBy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedBy]);

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  const renderProvideFeedbackForm = () => {
    if (!isProvidingFeedback) {
      return null;
    }

    // Define the satisfaction levels and the statements to rate
    const satisfactionLevels = [
      "Very Dissatisfied",
      "Dissatisfied",
      "Neutral",
      "Satisfied",
      "Highly Satisfied",
    ];
    const statements = ["How satisfied are you with the meeting?"];

    return (
      <div id="feedback-form">
        <div className="flex flex-row justify-between mt-5">
          <h2 className="text-2xl font-bold">Feedback Form</h2>
          <div
            className="cursor-pointer"
            onClick={() => setIsProvidingFeedback(false)}
          >
            <i className="fas fa-times"></i>
          </div>
        </div>
        <div>
          <div className="flex flex-col">
            <label htmlFor="rating" className="font-bold pt-5">
              How satisfied are you with the meeting?
            </label>
            <div className="flex flex-row justify-between">
              {satisfactionLevels.map((level) => (
                <div key={level} className="flex flex-col">
                  <label htmlFor={level}>{level}</label>
                  <input
                    type="radio"
                    name="satisfaction" // This should match the key in feedbackData
                    value={level}
                    checked={feedbackData.satisfaction === level}
                    onChange={handleFeedbackInputChange}
                    required
                  />
                </div>
              ))}
            </div>
            <div id="additional-comments" className="mt-5">
              <label htmlFor="explanation" className="font-bold">
                Please Explain
              </label>
              <textarea
                className="w-full border border-light-gray h-20"
                name="additional_comments" // This should match the key in feedbackData
                value={feedbackData.additional_comments}
                onChange={handleFeedbackInputChange}
              />
            </div>
          </div>
        </div>
        <br />
        {changesMade && (
          <div className="flex flex-row justify-end pb-10">
            <button
              className="bg-purple hover:bg-gold p-2 mt-3 ml-2 text-white rounded-md"
              onClick={handleProvideFeedback}
            >
              Save Changes
            </button>
            <button
              className="bg-purple hover:bg-gold p-2 mt-3 ml-2 text-white rounded-md"
              onClick={handleCancelFeedbackChanges}
            >
              Cancel Changes
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render the meeting details if a meeting is selected
  const renderMeetingDetails = () => {
    if (!selectedMeeting) {
      return null;
    }

    return (
      <div
        id="details-panel"
        className="flex flex-col font-body border border-light-gray rounded-md shadow-md p-5"
      >
        <div className="flex flex-row ">
          <h2 className="m-auto text-2xl font-body font-bold">
            Meeting Details
          </h2>
          <div
            className="cursor-pointer"
            onClick={() => {
              setSelectedMeeting(null);
              setIsProvidingFeedback(false);
            }}
          >
            <i className="fas fa-times"></i>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="flex">
            {((user.account_type === "student" && activeTab !== "past") ||
              (user.account_type === "mentor" && activeTab === "upcoming")) && (
              <button
                className="bg-purple text-white p-2 mt-3 ml-2 rounded-md hover:bg-gold"
                onClick={() =>
                  handleCancelMeeting(selectedMeeting.appointment_id)
                }
              >
                Cancel Meeting
              </button>
            )}
            {user.account_type === "mentor" && activeTab === "pending" && (
              <div>
                <button
                  className="bg-purple text-white p-2 mt-3 ml-2 rounded-md hover:bg-gold"
                  type="button"
                  onClick={() =>
                    handleStatusUpdate(
                      selectedMeeting.appointment_id,
                      "reserved"
                    )
                  }
                >
                  Approve Meeting
                </button>
                <button
                  className="bg-purple text-white p-2 mt-3 ml-2 rounded-md hover:bg-gold"
                  type="button"
                  onClick={() =>
                    handleCancelMeeting(selectedMeeting.appointment_id)
                  }
                >
                  Cancel Meeting
                </button>
              </div>
            )}
            {user.account_type === "mentor" && activeTab === "past" && (
              <div className="flex flex-row">
                <button
                  className="bg-purple text-white p-2 mt-3 ml-2 rounded-md hover:bg-gold"
                  type="button"
                  onClick={() =>
                    handleStatusUpdate(
                      selectedMeeting.appointment_id,
                      "completed"
                    )
                  }
                >
                  Attended
                </button>
                <button
                  className="bg-purple text-white p-2 mt-3 ml-2 rounded-md hover:bg-gold"
                  type="button"
                  onClick={() =>
                    handleStatusUpdate(selectedMeeting.appointment_id, "missed")
                  }
                >
                  Missed
                </button>
              </div>
            )}
            {activeTab === "past" && !feedbackPresent && (
              <div className="flex flex-row ml-2 mt-3">
                <br />
                <button
                  className=" bg-purple text-white hover:bg-gold rounded-md p-2"
                  onClick={handleFeedbackClick}
                >
                  Provide Feedback
                </button>
              </div>
            )}
          </div>
        </div>

        {isProvidingFeedback && renderProvideFeedbackForm()}
        <br />
        <div id="meeting-info" className="flex flex-col">
          <div className="flex flex-row">
            <label htmlFor="type" className="font-bold">
              Program&nbsp;
            </label>
            <Tooltip
              text={
                typeDescriptions.find(
                  (desc) => desc.id === Number(selectedMeeting.program_id)
                )?.description || "No description for this program :("
              }
            >
              <span>ⓘ</span>
            </Tooltip>
          </div>
          <label htmlFor="type">
            {typeDescriptions.find(
              (desc) => desc.id === Number(selectedMeeting.program_id)
            )?.type || "No name for this program"}
          </label>

          <label className="font-bold pt-2">Class</label>
          {selectedMeeting.class_name}

          <label htmlFor="date" className="font-bold pt-2">
            Date
          </label>
          {getDayFromDate(selectedMeeting.date) +
            ", " +
            formatDate(selectedMeeting.date)}

          <label htmlFor="time" className="font-bold pt-2">
            Time
          </label>
          {`${formatTime(selectedMeeting.start_time)} - ${formatTime(
            selectedMeeting.end_time
          )} (PST)`}

          <label htmlFor="status" className="font-bold pt-2">
            Current Status
          </label>
          {capitalizeFirstLetter(selectedMeeting.status)}

          <label htmlFor="notes" className="font-bold pt-2">
            Meeting Notes
          </label>
          <textarea
            className="w-full border border-light-gray h-20"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
          />

          {selectedMeeting.physical_location ? (
            <>
              <label className="font-bold pt-2">Physical Location</label>
              {selectedMeeting.physical_location}
            </>
          ) : null}

          <label htmlFor="meeting_url" className="font-bold pt-2">
            Your Meeting URL
          </label>
          <input
            className="w-full border border-light-gray bg-gray"
            type="text"
            name="meeting_url"
            value={formData.meeting_url}
            onChange={handleInputChange}
            disabled={activeTab === "past"}
          />
          {/* display student details if mentor view */}
          {user.account_type === "mentor" && selectedMeeting.student && (
            <div className="flex flex-col pt-5">
              <h2 className="text-2xl font-bold">Student Info</h2>
              <label htmlFor="name" className="font-bold pt-2">
                Name
              </label>
              {selectedMeeting.student.first_name}

              <label htmlFor="email" className="font-bold pt-2">
                Email
              </label>
              {selectedMeeting.student.email}
            </div>
          )}
          {/* display mentor details if student view */}
          {user.account_type === "student" &&
            selectedMeeting.mentor &&
            activeTab !== "pending" && (
              <div className="flex flex-col pt-5">
                <h2 className="text-2xl font-bold">Mentor Info</h2>
                <label htmlFor="name" className="font-bold pt-2">
                  Name
                </label>
                {selectedMeeting.mentor.first_name}

                <label htmlFor="email" className="font-bold pt-2">
                  Email
                </label>
                {selectedMeeting.mentor.email}
              </div>
            )}
        </div>
        {changesMade && (
          <div className="flex justify-end">
            <button
              className="bg-purple hover:bg-gold p-2 mt-3 ml-2 text-white rounded-md"
              onClick={handleSaveChanges}
            >
              Save Changes
            </button>
            <button
              className="bg-purple hover:bg-gold p-2 mt-3 ml-2 text-white rounded-md"
              onClick={handleCancelChanges}
            >
              Cancel Changes
            </button>
          </div>
        )}
        <br />
        <Comment appointmentId={selectedMeeting.appointment_id} />
      </div>
    );
  };

  const sortTable = (sort) => {
    const daysOfWeekOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ];

    const sortedData = [...data].sort((a, b) => {
      switch (sort) {
        case "Name":
          return a.type.localeCompare(b.type);
        case "class_name":
          return a.class_name.localeCompare(b.class_name);
        case "Day":
          return (
            daysOfWeekOrder.indexOf(getDayFromDate(a.date)) -
            daysOfWeekOrder.indexOf(getDayFromDate(b.date))
          );
        case "Date":
          const dateComparison = new Date(a.date) - new Date(b.date);
          if (dateComparison === 0) {
            return (
              new Date(`${a.date}T${a.start_time}`) -
              new Date(`${b.date}T${b.start_time}`)
            );
          }
          return dateComparison;
        case "Location":
          return a.physical_location.localeCompare(b.physical_location);
        case "Status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setData(sortedData);
  };

  // Display meeting list
  return (
    <div
      id="content-container"
      className="flex flex-col w-full m-auto items-center"
    >
      <div className="font-bold text-center text-2xl">
        <h1>Your {capitalizeFirstLetter(activeTab)} Appointments</h1>
      </div>
      <div id="tabs" className="p-2 m-2 rounded-md">
        <button
          className="bg-purple p-2 m-2 rounded-md text-white hover:text-gold"
          onClick={() => handleTabClick("upcoming")}
        >
          Upcoming
        </button>
        <button
          className="bg-purple p-2 m-2 rounded-md text-white hover:text-gold"
          onClick={() => handleTabClick("pending")}
        >
          Pending
        </button>
        <button
          className="bg-purple p-2 m-2 rounded-md text-white hover:text-gold"
          onClick={() => handleTabClick("past")}
        >
          Past
        </button>
      </div>

      <button
        className="font-bold border border-light-gray rounded-md shadow-md text-sm px-3 py-1 mb-2 place-self-start"
        onClick={() => setShowTable(!showTable)}
      >
        {showTable ? "Hide Table" : "Show Table"}
      </button>

      <div id="table" className="w-full">
        {selectedMeeting ? (
          renderMeetingDetails()
        ) : (
          <table className="w-full border text-center">
            {data.length > 0 ? (
              <>
                <thead className="bg-purple text-white">
                  <tr>
                    <th
                      className="border-r w-14% hover:bg-gold"
                      onClick={() => sortBy("Name")}
                    >
                      Type
                    </th>
                    <th
                      className="border-r w-14% cursor-pointer hover:bg-gold"
                      onClick={() => sortBy("class_name")}
                    >
                      Class Name
                    </th>
                    <th
                      className="border-r w-8% hover:bg-gold"
                      onClick={() => sortBy("Day")}
                    >
                      Day
                    </th>
                    <th
                      className={`border-r w-12% hover:bg-gold ${
                        hoveringDateOrTime ? "bg-gold" : ""
                      }`}
                      onClick={() => sortBy("Date")}
                      onMouseEnter={() => setHoveringDateOrTime(true)}
                      onMouseLeave={() => setHoveringDateOrTime(false)}
                    >
                      Date
                    </th>
                    <th
                      className={`border-r w-12% hover:bg-gold ${
                        hoveringDateOrTime ? "bg-gold" : ""
                      }`}
                      onClick={() => sortBy("Date")}
                      onMouseEnter={() => setHoveringDateOrTime(true)}
                      onMouseLeave={() => setHoveringDateOrTime(false)}
                    >
                      Time (PST)
                    </th>
                    <th
                      className="border-r w-12% hover:bg-gold"
                      onClick={() => sortBy("Location")}
                    >
                      Physical Location
                    </th>
                    <th className="border-r w-14%">Meeting URL</th>
                    <th
                      className="w-6% hover:bg-gold"
                      onClick={() => sortBy("Status")}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {showTable &&
                    data.map((meeting) => (
                      <tr
                        key={meeting.appointment_id}
                        onClick={() => handleMeetingClick(meeting)}
                        className="cursor-pointer hover:bg-gray border-b"
                      >
                        <td className="border-r">
                          {meeting.type || "-------"}
                        </td>
                        <td className="border-r">
                          {meeting.class_name || "-------"}
                        </td>
                        <td className="border-r">
                          {getDayFromDate(meeting.date) || "-------"}
                        </td>
                        <td className="border-r">
                          {formatDate(meeting.date) || "-------"}
                        </td>
                        <td className="border-r">
                          {meeting.start_time && meeting.end_time
                            ? `${formatTime(meeting.start_time)} - ${formatTime(
                                meeting.end_time
                              )}`
                            : "-------"}
                        </td>
                        <td className="border-r">
                          {meeting.physical_location || "-------"}
                        </td>
                        <td className="border-r">
                          {meeting.meeting_url || "-------"}
                        </td>
                        <td>
                          {capitalizeFirstLetter(meeting.status) || "-------"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </>
            ) : (
              <tbody>
                <tr>
                  <td colSpan="5">
                    <div>
                      <img
                        src="https://assets.calendly.com/assets/frontend/media/no-events-2ed89b6c6379caebda4e.svg"
                        alt="No appointments"
                        className="m-auto"
                      />
                      <h2 className="text-center">
                        No {activeTab} appointments
                      </h2>
                    </div>
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        )}
      </div>
    </div>
  );
}
