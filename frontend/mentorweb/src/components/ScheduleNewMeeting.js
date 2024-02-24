import React, { useState, useEffect, useContext } from 'react';
import { ScheduleMeeting } from 'react-schedule-meeting';
import { format } from 'date-fns';
import { getCookie } from '../utils/GetCookie';
import { UserContext } from '../context/UserContext';
import Appointment from './Appointment';

export default function ScheduleNewMeeting({ id }) {
    const { user } = useContext(UserContext);
    const [mentorshipType, setMentorshipType] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [showAppointmentPanel, setShowAppointmentPanel] = useState(false);
    const [selectedTimeslot, setSelectedTimeslot] = useState(null);
    const [availableTimeslots, setAvailableTimeslots] = useState([]);
    const [bookingConfirmed, setBookingConfirmed] = useState(false);
    const [appointmentNotes, setAppointmentNotes] = useState('');
    const [appointmentStatus, setAppointmentStatus] = useState('');
    const [typeDescriptions, setTypeDescriptions] = useState({});
    const [courseId, setCourseId] = useState('');
    const [selectedTimeDuration, setSelectedTimeDuration] = useState(0);
    const [selectedProgramId, setSelectedProgramId] = useState('');

    // Load Variables
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [allCourseData, setAllCourseData] = useState([]);
    const [selectedClassData, setSelectedClassData] = useState({
        id: '',
        class_name: '',
        programs: [],
      });

    useEffect(() => {
        if (mentorshipType && courseId !== '') {
            fetch(`/student/appointments-available/${encodeURIComponent(mentorshipType)}/${encodeURIComponent(courseId)}`)
                .then(response => response.json())
                .then(data => {
                    const timeslots = data.available_appointments
                        .filter(appointment => appointment.status === 'posted')
                        .map(appointment => ({
                            startTime: new Date(`${appointment.date}T${appointment.start_time}`),
                            endTime: new Date(`${appointment.date}T${appointment.end_time}`),
                            id: appointment.appointment_id
                        }));
                    setAvailableTimeslots(timeslots);

                    if (timeslots) {
                        const startDate = new Date(timeslots[0].startTime);
                        const endDate = new Date(timeslots[0].endTime);
                        const timeDifference = endDate - startDate;
                        const minutes = Math.floor(timeDifference / (1000 * 60));
                        setSelectedTimeDuration(minutes);
                    }
                })
                .catch(error => console.error('Error:', error));
        }
    }, [mentorshipType, courseId]);

    const handleMentorshipTypeChange = (event) => {
        setMentorshipType(event.target.value);
        if (event.target.value === "") {
            setShowCalendar(false);
        } else {
            setShowCalendar(true);
        }
        setSelectedTimeslot(null); // Reset the selected timeslot when changing type
        setShowAppointmentPanel(false);
    };

    const handleStartTimeSelect = (startTimeEventEmit) => {
        setSelectedTimeslot(startTimeEventEmit); // Update the selected timeslot state
        setShowAppointmentPanel(true)
    };

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
        setCourseId(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const bookAppointment = () => {
        if (selectedTimeslot) {
            const appointmentID = selectedTimeslot.availableTimeslot.id;
            const appointmentData = {
                notes: appointmentNotes,
            };
            const csrfToken = getCookie('csrf_access_token');
            let isHandledError = false; // flag to indicate if the error has been handled

            fetch(`/student/appointments/reserve/${appointmentID}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify(appointmentData),
            })
                .then(response => {
                    if (!response.ok) {
                        if (response.status === 409) {
                            alert('Sorry, this appointment is no longer available.');
                            setMentorshipType(''); // Reset the mentorship type
                            setShowAppointmentPanel(false);
                            setShowCalendar(false);
                            isHandledError = true; // Mark this error as handled
                            return; // Return early to avoid further processing
                        }
                        throw new Error('Failed to reserve appointment');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data) {
                        setAppointmentStatus(data.status)
                        setBookingConfirmed(true);
                    }
                })
                .catch(error => {
                    if (!isHandledError) { // Check if the error has not been handled
                        console.error('Error:', error);
                        alert('Failed to book the session. Please try again.');
                        setMentorshipType(''); // Reset the mentorship type
                        setShowAppointmentPanel(false);
                        setShowCalendar(false);
                    }
                });
        }
    };

    const cancelSelectedSlot = () => {
        selectedTimeslot.resetSelectedTimeState();
        setShowAppointmentPanel(false)
        setAppointmentNotes("");
    };

    const resetBooking = () => {
        setBookingConfirmed(false);
        setMentorshipType('');
        setShowCalendar(false);
        setShowAppointmentPanel(false);
        setSelectedTimeslot(null);
        setAppointmentNotes('');
    };

    const fetchCourseList = async () => {
        if (user.account_type !== "student") return;
      
        try {
          const response = await fetch(`/mentor/courses`, {
            credentials: 'include',
          });
      
          const fetchedCourseList = await response.json();
      
          setAllCourseData(fetchedCourseList);
        } catch (error) {
          console.error("Error fetching course list:", error);
        }
    };

    const handleProgramChange = (e) => {
        if (!e) {
        return;
        }

        let selectedProgram = parseInt(e.target.value);

        if (!selectedProgram) {
        selectedProgram = -1;
        }

        // change selectedCourseId
        setSelectedProgramId(selectedProgram);
        /*
        setMentorshipType(event.target.value);
        if (event.target.value === "") {
            setShowCalendar(false);
        } else {
            setShowCalendar(true);
        }
        setSelectedTimeslot(null); // Reset the selected timeslot when changing type
        setShowAppointmentPanel(false);
        */
    };

    // update the selectedClassData based on a courseId
    const updateCourseInfo = (courseId) => {
        if (!courseId) {
            setSelectedClassData({});
            return;
        }

        const selectedCourse = allCourseData.find(course => course.id === courseId);

        if (selectedCourse) {
            // Update selectedClassData with selectedCourse.id
            setSelectedClassData(selectedCourse);
        }
    };

    useEffect(() => {
        console.log("Changed!", id);
        updateCourseInfo(id);
    }, [id]);

    useEffect(() => {
        if (!isPageLoaded) {
          fetchCourseList();
          setIsPageLoaded(!isPageLoaded);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [isPageLoaded, user]);

    useEffect(() => {
        console.log(selectedClassData);
        console.log(allCourseData);
    }, [selectedClassData, allCourseData]);

    // If booking is confirmed, render the Appointment component, otherwise render the booking UI
    if (bookingConfirmed) {
        return <Appointment
            mentorshipType={mentorshipType}
            selectedTimeslot={selectedTimeslot}
            notes={appointmentNotes}
            meetingURL={user.meeting_url}
            resetBooking={resetBooking}
            status={appointmentStatus}
        />;
    }

    return (
        <div className='flex flex-col mt-3'>
            <div id="dropdown" className='flex flex-row'>
                <h1 className='whitespace-nowrap'><strong>Select Program Type:</strong></h1>
                <select className='border border-light-gray rounded ml-2'
                    id="mentorship-type"
                    value={mentorshipType}
                    onChange={handleMentorshipTypeChange}
                    required
                >
                    <option value="">Select...</option>
                    <option value="office_hours">Office Hours</option>
                </select>
                <select
                    className="border border-light-gray rounded ml-2"
                    id="course-dropdown"
                    value={selectedProgramId}
                    onChange={(e) => handleProgramChange(e)}
                >
                    <option key={-1} value="">
                    Select...
                    </option>
                    {selectedClassData.programs.map((program) => (
                    <option key={program.id} value={program.id}>{program.type}</option>
                    ))}
              </select>
            </div>
            <div className='text-2xl'>
                {typeDescriptions.length > 0 && (
                    <p>{typeDescriptions.find(desc => desc.name === mentorshipType)?.description}</p>
                )}
            </div>
            <div className='flex'>
                {showCalendar && (
                    <div className='w-4/5'>
                        <ScheduleMeeting
                            borderRadius={10}
                            primaryColor="#4b2e83"
                            eventDurationInMinutes={selectedTimeDuration}
                            availableTimeslots={availableTimeslots}
                            onStartTimeSelect={handleStartTimeSelect}
                        />
                    </div>
                )}
                {showAppointmentPanel && selectedTimeslot && (
                    <div className='rounded-lg shadow-2xl w-1/3 m-4'>
                        <div className='m-5'>
                            <h3 className='text-center pb-5 font-bold'>Appointment Details</h3>
                            <p className='pb-2'><b>Type</b>: {mentorshipType}</p>
                            <p className='pb-2'><b>Date</b>: {format(selectedTimeslot.startTime, "PPPP")}</p>
                            <p className='pb-2'><b>Time</b>: {format(selectedTimeslot.startTime, 'p')} - {format(selectedTimeslot.availableTimeslot.endTime, 'p')} (PST)</p>
                            <p className='pb-2'><b>Duration:</b> {selectedTimeDuration} minutes</p>
                            <label htmlFor='appointmentNotes'><b>Notes</b> (optional):</label>
                            <textarea className='w-full border border-light-gray'
                                id='appointmentNotes'
                                value={appointmentNotes}
                                onChange={(e) => setAppointmentNotes(e.target.value)}
                                placeholder='Please share anything that will help us prepare for the meeting.'
                            />
                            <div id="button-container" className="flex flex-row justify-end">
                                <button onClick={bookAppointment} className='bg-purple text-white p-2 rounded mr-3 mt-5 '>Confirm</button>
                                <button onClick={cancelSelectedSlot} className='bg-purple text-white p-2 rounded mt-5'>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}