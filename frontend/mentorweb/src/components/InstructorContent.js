/* InstructorContent.js
 * Last Edited: 3/11/24
 * 
 * Displays the Canvas Scheduler Tool purpose for instructor 
 * inside "Home" tab for instructor view.
 * 
 * Known bugs:
 * - None found
*/

import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { capitalizeFirstLetter } from "../utils/FormatDatetime";

export default function InstructorContent() {
    // General Variables 
    const { user } = useContext(UserContext);

    ////////////////////////////////////////////////////////
    //                 Render Functions                   //
    ////////////////////////////////////////////////////////

    // HTML for webpage
    return (
        <div className="flex flex-col w-2/3 m-auto items-center ">
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
            <h1 className="text-center text-4xl font-bold font-headlines text-purple p-5">Welcome to the Canvas Meeting Scheduler!</h1>
            <section className="">
                <p>The Canvas Meeting Scheduler utilizes a matching system which prioritizes taught courses and meeting types. To save time, the process is streamlined to focus on scheduling based on your availability.</p>
            </section>

            <section className="pt-10">
                <h2 className="text-purple text-2xl font-headlines pb-5">How to Use the Canvas Meeting Scheduler:</h2>
                <article className="pb-5">
                    <h4 className="text-purple font-headlines">Create a Program Type</h4>
                    <p>The program type encapsulates a meeting type and applies to all classes or a single course. Pick a course or all courses and create a program type with its description, physical or virtual location, and weekly times. 
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

            <p className="pt-5">Canvas Meeting Scheduler focuses on convenience and flexibility. By emphasizing courses and their program types, and availability, the goal is for you to have a centralized scheduling tool on Canvas.</p>
            <p className="pt-5">Start using the Canvas Meeting Scheduler today and create meetings with confidence. We're excited for you to not have to rely on 3rd party calendars to schedule meetings!</p>
        </div>
    );
}
