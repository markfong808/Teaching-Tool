/* Home.js
 * Last Edited: 3/19/24
 * 
 * Home Tab that Displays information about Canvas Meeting Scheduler
 * from a general, instructor, and student perspective.
 * General perspective shown when launching build or when instructor or student logs out. 
 * Instructor perspective shown when instructor logs in.
 * Student perspective shown when student logs in.
 * 
 * Known bugs:
 * - None found
 * 
*/

import React from "react";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { capitalizeFirstLetter } from "../utils/FormatDatetime";


export default function Home() {
    // General Variables
    const { user } = useContext(UserContext);
    ////////////////////////////////////////////////////////
    //                 Render Functions                   //
    ////////////////////////////////////////////////////////

    // HTML for webpage
    return (
        <div className= "flex flex-col w-2/3 m-auto items-center">
            {!user && (
                <>
                    <h1 className="text-purple text-center text-4xl font-headlines p-5">Welcome to Canvas Meeting Scheduler!</h1>
                    <section>
                        <p>This application provides students and instructors a centralized location to schedule meetings on Canvas.
                            The goal is to reduce the need of relying on 3rd party schedulers and difficulty finding office hours across courses.
                        </p>
                    </section>

                    <section className="my-5">
                        <h2 className="text-purple text-2xl font-headlines">How It Works</h2>
                        <article>
                            <p>
                                As an instructor, you'll have the flexibility to set your availability and define
                                meeting types and information about them for all courses. As a student you can view information about courses, when drop-in meetings are happening,
                                and book appointments based on instructor availabilities.
                                Allowing for simple, seamless, and efficient scheduling process.
                            </p>
                        </article>

                        <article className="my-5">
                            <h2 className="text-purple text-2xl font-headlines">Benefits of Canvas Meeting Scheduler</h2>
                            <p>By using the Canvas Meeting Scheduler, you will:</p>
                        </article>

                        <article className="my-5">
                            <h4 className="text-purple text-2xl font-headlines">Have One Place to Schedule Meetings</h4>
                            <p>
                                Instead of having to schedule meetings using different calendar applications, meetings can be
                                directly scheduled through the Canvas platform.
                            </p>
                        </article>

                        <article className="my-5">
                            <h4 className="text-purple text-2xl font-headlines">Create Availabilities & Appointments Seamlessly</h4>
                            <p>
                                Availabilities are made based on when an instructor can meet with students. Once an instructor makes an availability,
                                this availability can apply to all courses taught or a single course. The instructor can include relevant information about the availability
                                and manage the availability once created. Students can then view these availabilities, and book appointments when the availability times work best for them.
                                Both students and instructors can view, edit appointment details, cancel appointments, and provide feedback after an appointment is finished.
                            </p>
                        </article >

                        <article className="my-5">
                            <h4 className="text-purple text-2xl font-headlines">Gain Personal Satisfaction</h4>
                            <p>
                                Students don't have to worry anymore about adapting to specific tools that aren't universal when scheduling meetings.
                                Instructors have a scheduling tool which allows them to manage all information related to meetings for all courses
                                they teach in a quarter. Empowering both students and instructors to use an all-encompassing tool to schedule and manage appointments.
                            </p>
                        </article>
                    </section>
                </>
            )}

            {user && (
                <>
                    {user.status === 'inactive' && (
                        <div className="">
                            <p>Account Status: {capitalizeFirstLetter(user.status)}</p>
                            <p>Please contact the admin <a href="mailto:markk@uw.edu">(markk@uw.edu)</a> to activate your account.</p>
                        </div>
                    )}
                    {user.status === 'pending' && (
                        <div className="">
                            <p>Account Status: {capitalizeFirstLetter(user.status)}</p>
                            <p>Your account is currently under review. Please contact the admin <a href="mailto:markk@uw.edu">(markk@uw.edu)</a> if needed.</p>
                        </div>
                    )}

                    {user.account_type === "mentor" && (
                        <>
                            <h1 className="text-center text-4xl font-bold font-headlines text-purple p-5">Welcome to Canvas Meeting Scheduler!</h1>
                            <section className="">
                                <p>The Canvas Meeting Scheduler utilizes a matching system which prioritizes taught courses and meeting types. To save time, the process is streamlined to focus on scheduling based on your availability.</p>
                            </section>

                            <section className="pt-5">
                                <h2 className="text-purple text-2xl font-headlines pb-5">How to Use the Canvas Meeting Scheduler:</h2>
                                <article className="pb-5">
                                    <h4 className="text-purple font-headlines">Create a Program Type</h4>
                                    <p>The program type encapsulates a meeting type and applies to all classes or a single course. Pick a course or all courses and
                                        create a program type with its description, physical or virtual location, and weekly times.
                                        Each program type will include if it's drop-in or appointment based and if the program type is for a day or range of dates.</p>
                                </article>

                                <article className="pb-5">
                                    <h4 className="text-purple font-headlines">Create Meeting Dates</h4>
                                    <p>Once the relevant information for a program type is entered, you can choose the meeting dates that work based on your weekly availability by interacting with a current calendar and define durations if the meeting is appointment based.</p>
                                </article>

                                <article className="pb-5">
                                    <h4 className="text-purple font-headlines">Manage Times</h4>
                                    <p>Once meeting dates are established, you can keep track of your availabilities and any appointments that are scheduled, change the status or delete an availability, and approve or cancel appointments that a student books.</p>
                                </article>

                                <article className="pb-5">
                                    <h4 className="text-purple font-headlines">Attend Meeting</h4>
                                    <p>On the scheduled date and time, attend scheduled appointment or drop-in meeting with student based on the selected program type.</p>
                                </article>

                                <article className="pb-5">
                                    <h4 className="text-purple font-headlines">Share Your Experience</h4>
                                    <p>After each appointment, provide insights and ratings based on your experience.</p>
                                </article>
                            </section>

                            <p className="pb-5">Canvas Meeting Scheduler focuses on convenience and flexibility. By emphasizing courses and their program types, and availability, the goal is for you to have a centralized scheduling tool on Canvas.</p>
                            <p className="pb-5">Start using the Canvas Meeting Scheduler today and create meetings with confidence. We're excited for you to not have to rely on 3rd party calendars to schedule meetings!</p>
                        </>
                    )}

                    {user.account_type === "student" && (
                        <>
                            <h1 className="text-purple text-4xl font-headlines p-5">Welcome to Canvas Meeting Scheduler!</h1>
                            <section className="">
                                <p>The Canvas Meeting Scheduler utilizes a matching system based on your enrolled courses and professor's availability. The process is streamlined to schedule meetings on desired appointment date and time.</p>
                            </section>

                            <section className="pt-5">
                                <h2 className="text-purple text-2xl font-headlines pb-5">How to Use the Canvas Meeting Scheduler:</h2>
                                <article className="pb-5">
                                    <h4 className="text-purple font-headlines">View Course Details</h4>
                                    <p>You can check details about the courses you're enrolled in. The details include course & office hours, course & office hours location, discord link, comments, instructor information, and class recording link.</p>
                                </article>

                                <article className="pb-5">
                                    <h4 className="text-purple font-headlines">Obtain Drop-In Meeting Information</h4>
                                    <p>Whether it's for a course or all courses, you can see drop-in meetings and plan accordingly in attending them.</p>
                                </article>

                                <article className="pb-5">
                                    <h4 className="text-purple font-headlines">Explore Available Appointment Times</h4>
                                    <p>Each time slot represents a potential meeting, allowing you to choose the most suitable option for your schedule.</p>
                                </article>

                                <article className="pb-5">
                                    <h4 className="text-purple font-headlines">Select Your Preferred Appointment Time</h4>
                                    <p>Choose the desired time slot to schedule your appointment. Any available time slot indicates a professor's availability for the selected course and meeting type.</p>
                                </article>

                                <article className="pb-5">
                                    <h4 className="text-purple font-headlines">Confirm Your Appointment</h4>
                                    <p>After selecting a time slot, you'll be guided through a confirmation process to secure your appointment. Review the session details, double-check the chosen date and time, and proceed to confirm your booking.</p>
                                </article>

                                <article className="pb-5">
                                    <h4 className="text-purple font-headlines">Manage Your Appointments</h4>
                                    <p>You can manage your appointments by viewing, editing, and canceling them.</p>
                                </article>

                                <article className="pb-5">
                                    <h4 className="text-purple font-headlines">Attend Meeting</h4>
                                    <p>On the scheduled date and time, attend appointment or drop-in meeting with professor.</p>
                                </article>

                                <article className="pb-5">
                                    <h4 className="text-purple font-headlines">Share Your Experience</h4>
                                    <p>After each appointment, provide insights and ratings based on your experience.</p>
                                </article>
                            </section>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
