import React, { useEffect, useState } from "react";

export default function ViewFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => {
    // Function to fetch feedback data from the backend
    const fetchFeedbackData = async () => {
      try {
        const response = await fetch("/feedback/all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFeedbackList(data.feedback_list);
        } else {
          console.error("Failed to fetch feedback data");
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    };

    fetchFeedbackData();
  }, []);

  const downloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    // Add CSV headers
    csvContent +=
      "AppointmentID, Appointment Type, Student Name, Student Rating, Student Feedback, instructor Name, instructor Rating, instructor Feedback, Start Time, End Time, Appointment Date, Meeting URL, Notes, Student ID, instructor ID, Appointment Status\r\n";

    feedbackList.forEach((feedback) => {
      const row = [
        feedback.appointment_id,
        feedback.appointment_type,
        feedback.attendee_id,
        feedback.attendee_rating,
        `"${feedback.attendee_notes.replace(/"/g, '""')}"`, // Escape quotes
        feedback.instructor_id, // Assuming this is the instructor name
        feedback.instructor_rating,
        `"${feedback.instructor_notes.replace(/"/g, '""')}"`, // Escape quotes
        feedback.appointment_data.start_time,
        feedback.appointment_data.end_time,
        feedback.appointment_data.appointment_date,
        feedback.appointment_data.meeting_url,
        `"${feedback.appointment_data.notes.replace(/"/g, '""')}"`, // Escape quotes
        feedback.appointment_data.attendee_id,
        feedback.appointment_data.instructor_id,
        feedback.appointment_data.status,
      ].join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "feedback_data.csv");
    link.click();
    document.body.appendChild(link);
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col m-auto w-2/3">
      <h1 className="text-2xl font-bold text-center">View Feedback</h1>
      <div className="flex flex-row justify-end py-5">
        <button
          className="bg-purple text-white p-2 hover:text-gold rounded-md"
          onClick={downloadCSV}
        >
          Download Feedback Details
        </button>
      </div>
      <table className="w-full border">
        <thead className="bg-purple text-white">
          <tr>
            <th className="border-r text-start">Appointment Type</th>
            <th className="border-r text-start">Student</th>
            <th className="border-r text-start">Student Feedback</th>
            <th className="border-r text-start">instructor</th>
            <th className="border-r text-start">instructor Feedback</th>
          </tr>
        </thead>
        <tbody>
          {feedbackList.map((feedback, index) => (
            <tr className="border-b" key={index}>
              <td className="border-r text-start">
                {feedback.appointment_type}
              </td>
              <td className="border-r text-start">{feedback.attendee_id}</td>
              <td className="border-r text-start">{feedback.attendee_notes}</td>
              <td className="border-r text-start">{feedback.instructor_id}</td>
              <td className="border-r text-start">
                {feedback.instructor_notes}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {feedbackList.length === 0 && <p>No feedback data available.</p>}
    </div>
  );
}
