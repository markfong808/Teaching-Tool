import React from "react";
import { UserContext } from "../context/UserContext";
import { capitalizeFirstLetter } from "../utils/FormatDatetime";

export default function MentorContent() {
    const { user } = React.useContext(UserContext);
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
            <h1 className="text-center text-4xl font-bold font-headlines text-purple p-5">Welcome to our Mentorship Scheduling Tool!</h1>
            <section className="">
                <p>Our scheduling tool utilizes an anonymous matching system that prioritizes your availability and preferences. We understand that your time is important, so we've streamlined the process to focus on scheduling based on your desired appointment date and time.</p>
            </section>

            <section className="pt-10">
                <h2 className="text-purple text-2xl font-headlines pb-5">How to Use the Scheduling Tool:</h2>
                <article className="pb-5">
                    <h4 className="text-purple font-headlines">Explore Available Time Slots</h4>
                    <p>When accessing our scheduling tool, you'll use the calendar interface displaying available dates and times for mentorship sessions. Each time slot represents a potential session, allowing you to choose the most suitable option for your schedule.</p>
                </article>

                <article className="pb-5">
                    <h4 className="text-purple font-headlines">Select Your Preferred Time Slot</h4>
                    <p>Browse through the calendar, identify the date and time that works best for you, and simply click on the desired time slot to schedule your appointment. Rest assured that any available time slot indicates a mentor's availability without revealing their identity.</p>
                </article>

                <article className="pb-5">
                    <h4 className="text-purple font-headlines">Confirm Your Appointment</h4>
                    <p>After selecting a time slot, you'll be guided through a confirmation process to secure your appointment. Review the session details, double-check the chosen date and time, and proceed to confirm your booking.</p>
                </article>

                <article className="pb-5">
                    <h4 className="text-purple font-headlines">Prepare for Your Session</h4>
                    <p>Once your appointment is confirmed, you will receive a confirmation email containing all the necessary details. Be sure to check your email for any specific instructions or requirements provided.</p>
                </article>

                <article className="pb-5">
                    <h4 className="text-purple font-headlines">Attend Your Mentorship Session</h4>
                    <p>On the scheduled date and time, be ready to engage with your mentor in a productive and enriching session. Our mentors are dedicated professionals committed to helping you succeed and achieve your learning goals.</p>
                </article>

                <article className="pb-5">
                    <h4 className="text-purple font-headlines">Share Your Experience</h4>
                    <p>After each session, we value your feedback. Feel free to provide insights and ratings based on your experience, as this helps us maintain the quality of our mentorship program.</p>
                </article>
            </section>

            <p className="pt-10">Our scheduling tool focuses on convenience, flexibility, and maintaining your privacy. By emphasizing availability rather than mentor identity during the scheduling process, we aim to ensure you have a seamless experience while receiving the support you need to excel.</p>
            <p className="pt-5">Start using our scheduling tool today and embark on your learning journey with confidence. We're excited to connect you with mentors who are passionate about guiding you towards success!</p>
        </div>
    );
}
