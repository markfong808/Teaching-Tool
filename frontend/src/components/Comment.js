/* Comment.js
 * Last Edited: 3/26/24
 *
 * Comment section UI within Appointment Details Popup
 * where students and instructors can enter comments about an appointment.
 *
 * Known bugs:
 * -
 *
 */

import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { getCookie } from "../utils/GetCookie";

export default function Comment({ appointmentId }) {
  // General Variables
  const { user } = useContext(UserContext);
  const csrfToken = getCookie("csrf_access_token");

  // Load Variables
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Comment Data Variables
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  ////////////////////////////////////////////////////////
  //               Fetch Get Functions                  //
  ////////////////////////////////////////////////////////

  // fetches comments for the appointment
  const fetchComments = async () => {
    // if not a user
    if (user.account_type !== "instructor" || user.account_type !== "student")
      return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/${user.account_type}/appointments/${appointmentId}/comment`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": csrfToken,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
      // bad response checker
      else {
        const errorText = await response.text();
        setError("Error fetching comments: " + errorText);
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  ////////////////////////////////////////////////////////
  //               Fetch Post Functions                 //
  ////////////////////////////////////////////////////////

  // posts a comment to the appointment
  const handleSubmit = async (e) => {
    // if not a user
    if (user.account_type !== "instructor" || user.account_type !== "student")
      return;

    e.preventDefault();
    const payload = { appointment_comment: comment };
    try {
      const response = await fetch(
        `/${user.account_type}/appointments/${appointmentId}/comment`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": csrfToken,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        fetchComments(); // re-fetch comments
      }
      // bad response checker
      else {
        const errorText = await response.text();
        alert("Error posting comment: " + errorText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // delete the comment from the AppointmentComments Table
  const handleDelete = async (id) => {
    // if not a user
    if (user.account_type !== "instructor" || user.account_type !== "student")
      return;

    try {
      await fetch(
        `/${user.account_type}/appointments/${appointmentId}/comment/${id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": csrfToken,
          },
        }
      );

      // update comments variable with new data
      setComments(comments.filter((comment) => comment.id !== id));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  ////////////////////////////////////////////////////////
  //                 UseEffect Functions                //
  ////////////////////////////////////////////////////////

  // on initial load, fetch comments
  useEffect(() => {
    if (!initialLoad) {
      fetchComments();
    }
    setInitialLoad(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId, initialLoad, user.account_type]);

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  return (
    // Define Comments component which is called in AppointmentsTable.js
    <div className="flex flex-col mt-5">
      {/* Comments label */}
      <h1 className="text-2xl font-bold">Comments</h1>
      <form className="flex" onSubmit={handleSubmit}>

        {/* Comment input field */}
        <input
          className="border border-light-gray p-2 w-full"
          type="text"
          name="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
        />

        {/* Post button */}
        <button
          className="bg-purple text-white p-2 ml-2 rounded-md"
          type="submit"
        >
          Post
        </button>
      </form>

      {/* Comments container for list of Comments */}
      <div id="comments-container">
        {isLoading ? (
          <p>Loading comments...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          comments.map((comment, index) => (
            <div
              key={index}
              className="flex flex-col border border-light-gray p-2 mt-2"
            >
              <div className="flex justify-between">
                <p className="font-bold">

                  {/* Display instructor or student information based on who left the Comment for the Appointment */}
                  {user.account_type === "student" ? (
                    <>
                      {comment.name} <i>({comment.pronouns})</i>
                    </>
                  ) : (
                    <>
                      {comment.title} {comment.name} <i>({comment.pronouns})</i>
                    </>
                  )}
                </p>

                {/* Delete button for a Comment & date and time of listed Comment */}
                <div className="flex relative">
                  <button onClick={() => handleDelete(comment.id)}>X</button>
                  <p className="text-xs absolute top-1 right-5 w-36">
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Appointment Comment itself left by instructor or student */}
              <p>{comment.appointment_comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
