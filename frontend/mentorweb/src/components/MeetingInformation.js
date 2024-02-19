import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { formatTime, formatDate, getDayFromDate, capitalizeFirstLetter } from "../utils/FormatDatetime.js";
import { getCookie } from "../utils/GetCookie.js"
import { Tooltip } from "../components/Tooltip.js";
import Comment from "../components/Comment.js";

export default function MeetingInformation() {
    const [data, setData] = useState([]);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const { user } = useContext(UserContext);
    const [typeDescriptions, setTypeDescriptions] = useState({}); // [type: string]: string
    const [isProvidingFeedback, setIsProvidingFeedback] = useState(false);
    const [feedbackPresent, setFeedbackPresent] = useState(false);
    const [feedbackData, setFeedbackData] = useState({
        satisfaction: '',
        additional_comments: ''
    });
    const [formData, setFormData] = useState({
        notes: '',
        meeting_url: '',
    });
    const [changesMade, setChangesMade] = useState(false);


    useEffect(() => {
        if (selectedMeeting) {
            setFormData({
                notes: selectedMeeting.notes || '',
                meeting_url: selectedMeeting.meeting_url || '',
                status: selectedMeeting.status || '',
            });
            setChangesMade(false);
        }
    }, [selectedMeeting]);

    const fetchMeetings = async () => {
        if (!user) return; // If there's no user, we can't fetch meetings
        const apiEndpoint = user.account_type === "mentor"
            ? `/mentor/appointments`
            : `/student/appointments`;

        try {
            const response = await fetch(`${apiEndpoint}?type=${activeTab}`, {
                credentials: 'include',
            });
            const apiData = await response.json();
            const key = user.account_type === "mentor" ? 'mentor_appointments' : 'student_appointments';

            // Sort the meetings based on the date and start time
            const sortedData = (apiData[key] || []).sort((a, b) => {
                // Convert date and time to Date objects for comparison
                const dateTimeA = new Date(`${a.date}T${a.start_time}`);
                const dateTimeB = new Date(`${b.date}T${b.start_time}`);
                return dateTimeA - dateTimeB; // This will sort in ascending order
            });

            setData(sortedData);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchMeetings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, activeTab]);

    const fetchProgramTypeDetails = async () => {
        if (!user) return;
        try {
            const response = await fetch(`/programs`, {
                credentials: 'include',
            });
            const apiData = await response.json();
            const programDetails = apiData.map(program => ({
                name: program.name,
                description: program.description
            }));
            setTypeDescriptions(programDetails);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchProgramTypeDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setChangesMade(true);
    };

    const handleSaveChanges = async () => {
        if (!selectedMeeting) return;

        // Get CSRF token from the cookie.
        const csrfToken = getCookie('csrf_access_token');
        const payload = {
            ...formData,
            appointment_id: selectedMeeting.appointment_id,
        };
        try {
            const response = await fetch(`/meetings/update`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
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
                throw new Error('Failed to update the meeting');
            }
        } catch (error) {
            console.error("Error updating meeting:", error);
        }
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName); // Update the active tab state
        setSelectedMeeting(null); // Reset the selected meeting details
    };

    const handleMeetingClick = (meeting) => {
        setSelectedMeeting(meeting);
        fetchFeedback();
    };

    const handleStatusUpdate = async (appointmentId, newStatus) => {
        // Get CSRF token from the cookie.
        const csrfToken = getCookie('csrf_access_token');
        const payload = {
            appointment_id: appointmentId,
            status: newStatus,
        };
        try {
            const response = await fetch(`/meeting/update/status`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                // Update the selected meeting with the new formData
                setSelectedMeeting({ ...selectedMeeting, status: newStatus });
                alert("Meeting status updated successfully!");
                fetchMeetings(); // Re-fetch meetings to update 
            } else {
                throw new Error('Failed to update the meeting status');
            }
        } catch (error) {
            console.error("Error updating meeting status:", error);
        }
    };

    const fetchFeedback = async () => {
        if (!selectedMeeting) return;

        try {
            const response = await fetch(`/feedback/${selectedMeeting.appointment_id}`, {
                credentials: 'include',
            });
            const apiData = await response.json();

            let feedbackExists = false;
            if (user.account_type === 'student') {
                feedbackExists = apiData.student_rating || apiData.student_notes;
            } else if (user.account_type === 'mentor') {
                feedbackExists = apiData.mentor_rating || apiData.mentor_notes;
            }

            setFeedbackPresent(feedbackExists);

        } catch (error) {
            console.error("Error fetching feedback:", error);
        }
    };

    useEffect(() => {
        fetchFeedback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMeeting]);

    const handleFeedbackInputChange = (e) => {
        const { name, value } = e.target;
        setFeedbackData({ ...feedbackData, [name]: value });
        setChangesMade(true);
    };

    const handleCancelFeedbackChanges = () => {
        setFeedbackData({
            satisfaction: '',
            additional_comments: ''
        });
        setChangesMade(false);
    }

    const handleFeedbackClick = () => {
        setIsProvidingFeedback(true);
        // Set the initial state for feedbackData including the appointment_id from the selected meeting
        setFeedbackData({
            satisfaction: '',
            additional_comments: '',
            appointment_id: selectedMeeting ? selectedMeeting.appointment_id : null
        });
        setChangesMade(false);
    };

    const handleProvideFeedback = async (event) => {
        event.preventDefault();

        const csrfToken = getCookie('csrf_access_token');
        const payload = {
            ...feedbackData
        };

        try {
            const response = await fetch(`/feedback/add`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert("Thank you for your feedback!");
                setIsProvidingFeedback(false);
                setChangesMade(false);
                setFeedbackData({
                    satisfaction: '',
                    additional_comments: '',
                    appointment_id: null
                });
                fetchMeetings();
            } else {
                throw new Error('Failed to provide feedback');
            }
        } catch (error) {
            console.error("Error providing feedback:", error);
        }
    };

    const renderProvideFeedbackForm = () => {
        if (!isProvidingFeedback) {
            return null;
        }

        // Define the satisfaction levels and the statements to rate
        const satisfactionLevels = ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Highly Satisfied'];
        const statements = [
            'How satisfied are you with the meeting?'
        ];

        return (
            <div id="feedback-form">
                <div className="flex flex-row justify-between mt-5">
                    <h2 className="text-2xl font-bold">Feedback Form</h2>
                    <div className="cursor-pointer" onClick={() => setIsProvidingFeedback(false)}>
                        <i className="fas fa-times"></i>
                    </div>
                </div>
                <div>
                    <div className="flex flex-col">
                        <label htmlFor="rating" className="font-bold pt-5">
                            How satisfied are you with the meeting?
                        </label>
                        <div className="flex flex-row justify-between">
                            {satisfactionLevels.map(level => (
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
                            <textarea className="w-full border border-light-gray h-20"
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
                        <button className="bg-purple hover:bg-gold p-2 mt-3 ml-2 text-white rounded-md" onClick={handleProvideFeedback}>Save Changes</button>
                        <button className="bg-purple hover:bg-gold p-2 mt-3 ml-2 text-white rounded-md" onClick={handleCancelFeedbackChanges}>Cancel Changes</button>
                    </div>
                )}
            </div>
        );
    };

    const handleCancelChanges = () => {
        // Reset form data to initial meeting data
        setFormData({
            notes: selectedMeeting.notes || '',
            meeting_url: selectedMeeting.meeting_url || '',
            status: selectedMeeting.status || '',
        });
        setChangesMade(false); // Reset changes made
    }

    const handleCancelMeeting = async (appointmentId) => {
        if (window.confirm("Are your sure you want to cancel this meeting?")) {
            // Construct the endpoint based on account type
            const cancelEndpoint = user.account_type === "mentor"
                ? `/mentor/appointments/cancel/${appointmentId}`
                : `/student/appointments/cancel/${appointmentId}`;

            // Get CSRF token from the cookie. You might need a utility function to parse cookies.
            const csrfToken = getCookie('csrf_access_token');

            try {
                const response = await fetch(cancelEndpoint, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken, // Include the CSRF token in the request header
                    },
                });

                if (response.ok) {
                    // If the cancellation was successful, update the state to reflect that
                    alert("Meeting canceled successfully!")
                    setActiveTab('upcoming')
                    setSelectedMeeting(null); // Deselect the meeting as it is now cancelled
                    fetchMeetings(); // Re-fetch meetings to update the list
                } else {
                    throw new Error('Failed to cancel the meeting');
                }
            } catch (error) {
                console.error("Error cancelling meeting:", error);
            }
        }
    };

    // Render the meeting details if a meeting is selected
    const renderMeetingDetails = () => {
        if (!selectedMeeting) {
            return null;
        }

        return (
            <div id="details-panel" className="flex flex-col font-body border border-light-gray rounded-md shadow-md p-5">
                <div className="flex flex-row ">
                    <h2 className="m-auto text-2xl font-body font-bold">Meeting Details</h2>
                    <div className="cursor-pointer" onClick={() => { setSelectedMeeting(null); setIsProvidingFeedback(false); }}>
                        <i className="fas fa-times"></i>
                    </div>
                </div>

                <div className="flex justify-end">
                    <div className="flex">
                        {((user.account_type === 'student' && activeTab !== 'past') ||
                            (user.account_type === 'mentor' && activeTab === 'upcoming')) && (
                                <button className="bg-purple text-white p-2 mt-3 ml-2 rounded-md hover:bg-gold"
                                    onClick={() => handleCancelMeeting(selectedMeeting.appointment_id)}>
                                    Cancel Meeting
                                </button>
                            )}
                        {user.account_type === 'mentor' && activeTab === 'pending' && (
                            <div >
                                <button className="bg-purple text-white p-2 mt-3 ml-2 rounded-md hover:bg-gold"
                                    type="button"
                                    onClick={() => handleStatusUpdate(selectedMeeting.appointment_id, 'reserved')}
                                >
                                    Approve Meeting
                                </button>
                                <button className="bg-purple text-white p-2 mt-3 ml-2 rounded-md hover:bg-gold"
                                    type="button"
                                    onClick={() => handleCancelMeeting(selectedMeeting.appointment_id)}
                                >
                                    Cancel Meeting
                                </button>
                            </div>
                        )}
                        {user.account_type === 'mentor' && activeTab === 'past' && (
                            <div className="flex flex-row">
                                <button className="bg-purple text-white p-2 mt-3 ml-2 rounded-md hover:bg-gold"
                                    type="button"
                                    onClick={() => handleStatusUpdate(selectedMeeting.appointment_id, 'completed')}
                                >
                                    Attended
                                </button>
                                <button className="bg-purple text-white p-2 mt-3 ml-2 rounded-md hover:bg-gold"
                                    type="button"
                                    onClick={() => handleStatusUpdate(selectedMeeting.appointment_id, 'missed')}
                                >
                                    Missed
                                </button>
                            </div>
                        )}
                        {activeTab === 'past' && !feedbackPresent && (
                            <div className="flex flex-row ml-2 mt-3">
                                <br />
                                <button className=" bg-purple text-white hover:bg-gold rounded-md p-2" onClick={handleFeedbackClick}>Provide Feedback</button>
                            </div>
                        )}
                    </div>
                </div>

                {isProvidingFeedback && renderProvideFeedbackForm()}
                <br />
                <div id="meeting-info" className="flex flex-col">
                    <div className="flex flex-row">
                        <label htmlFor="type" className="font-bold">
                            Type&nbsp;
                        </label>
                        <Tooltip text={typeDescriptions.find(desc => desc.name === selectedMeeting.type).description}>
                            <span>ⓘ

                            </span>
                        </Tooltip>
                    </div>
                    {selectedMeeting.type}


                    <label htmlFor="date" className="font-bold pt-2">Date</label>
                    {getDayFromDate(selectedMeeting.date) + ", " + formatDate(selectedMeeting.date)}

                    <label htmlFor="time" className="font-bold pt-2">Time</label>
                    {`${formatTime(selectedMeeting.start_time)} - ${formatTime(selectedMeeting.end_time)} (PST)`}

                    <label htmlFor="status" className="font-bold pt-2">Current Status</label>
                    {capitalizeFirstLetter(selectedMeeting.status)}

                    <label htmlFor="notes" className="font-bold pt-2">Meeting Notes</label>
                    <textarea className="w-full border border-light-gray h-20"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                    />

                    <label htmlFor="meeting_url" className="font-bold pt-2">Student's Meeting URL</label>
                    <input className="w-full border border-light-gray bg-gray"
                        type="text"
                        name="meeting_url"
                        value={formData.meeting_url}
                        onChange={handleInputChange}
                        disabled={activeTab === 'past'}
                    />
                    {/* display student details if mentor view */}
                    {user.account_type === 'mentor' && selectedMeeting.student && (
                        <div className="flex flex-col pt-5">
                            <h2 className="text-2xl font-bold">Student Info</h2>
                            <label htmlFor="name" className="font-bold pt-2">Name</label>
                            {selectedMeeting.student.first_name}

                            <label htmlFor="email" className="font-bold pt-2">Email</label>
                            {selectedMeeting.student.email}

                            <label htmlFor="about" className="font-bold pt-2">About</label>
                            {selectedMeeting.student.about}

                            <label htmlFor="social_url" className="font-bold pt-2">Social URL</label>
                            {selectedMeeting.student.social_url}
                        </div>
                    )}
                    {/* display mentor details if student view */}
                    {user.account_type === 'student' && selectedMeeting.mentor && activeTab !== 'pending' && (
                        <div className="flex flex-col pt-5">
                            <h2 className="text-2xl font-bold">Mentor Info</h2>
                            <label htmlFor="name" className="font-bold pt-2">Name</label>
                            {selectedMeeting.mentor.first_name}

                            <label htmlFor="email" className="font-bold pt-2">Email</label>
                            {selectedMeeting.mentor.email}

                            <label htmlFor="about" className="font-bold pt-2">About</label>
                            {selectedMeeting.mentor.about}

                            <label htmlFor="social_url" className="font-bold pt-2">Social URL</label>
                            {selectedMeeting.mentor.social_url}
                        </div>
                    )}
                </div>
                {changesMade && (
                    <div className="flex justify-end">
                        <button className="bg-purple hover:bg-gold p-2 mt-3 ml-2 text-white rounded-md" onClick={handleSaveChanges}>Save Changes</button>
                        <button className="bg-purple hover:bg-gold p-2 mt-3 ml-2 text-white rounded-md" onClick={handleCancelChanges}>Cancel Changes</button>
                    </div>
                )}
                <br />
                <Comment appointmentId={selectedMeeting.appointment_id} />


            </div>
        );
    };

    // Display meeting list
    return (
        <div id="content-container" className="flex flex-col w-2/3 m-auto items-center">
            <div className="font-bold text-center text-2xl">
                <h1>Your {capitalizeFirstLetter(activeTab)} Meetings</h1>
            </div>
            <div id="tabs" className=" p-2 m-2 rounded-md">
                <button className="bg-purple p-2 m-2 rounded-md text-white hover:text-gold" onClick={() => handleTabClick('upcoming')}>Upcoming</button>
                <button className="bg-purple p-2 m-2 rounded-md text-white hover:text-gold" onClick={() => handleTabClick('pending')}>Pending</button>
                <button className="bg-purple p-2 m-2 rounded-md text-white hover:text-gold" onClick={() => handleTabClick('past')}>Past</button>
            </div>
            <div id="table" className="w-2/3 ">
                {selectedMeeting ? renderMeetingDetails() : (
                    <table className="w-full border">
                        {data.length > 0 ? (
                            <>
                                <thead className="bg-purple text-white">
                                    <tr>
                                        <th className="border-r text-start">Type</th>
                                        <th className="border-r text-start">Day</th>
                                        <th className="border-r text-start">Date</th>
                                        <th className="border-r text-start">Time (PST)</th>
                                        <th className="text-start">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((meeting) => (
                                        <tr key={meeting.appointment_id} onClick={() => handleMeetingClick(meeting)} className="hover:bg-gray border-b">
                                            <td className="cursor-pointer text-blue underline border-r">{meeting.type}</td>
                                            <td className='border-r'>{getDayFromDate(meeting.date)}</td>
                                            <td className='border-r'>{formatDate(meeting.date)}</td>
                                            <td className='border-r'>{formatTime(meeting.start_time)} - {formatTime(meeting.end_time)}</td>
                                            <td>{capitalizeFirstLetter(meeting.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </>
                        ) : (
                            <tbody>
                                <tr>
                                    <td colSpan="5">
                                        <div>
                                            <img src="https://assets.calendly.com/assets/frontend/media/no-events-2ed89b6c6379caebda4e.svg" alt="No meetings" className="m-auto" />
                                            <h2 className="text-center">No {activeTab} meetings</h2>
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