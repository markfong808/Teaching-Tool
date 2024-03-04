/* HomeContent.js
 * Last Edited: 3/1/24
 * 
 * Home Tab that Displays information about website when user
 * enters webpage for the first time or tabs over from
 * Login or Register Tabs
 * 
 * Known bugs:
 * - None found
*/

import React from "react";

export default function HomeContent() {
    ////////////////////////////////////////////////////////
    //                 Render Functions                   //
    ////////////////////////////////////////////////////////
    
    // HTML for webpage
    return (
        <div className="w-2/3 m-auto mt-8">
            <h1 className="text-purple text-center text-4xl font-headlines">Welcome to UWTechPrep!</h1>
            <section>
                <p>At TechPrep, we connect industry professionals with CS students seeking guidance for technical interviews.
                    As a mentor, you'll set your availability and offer sessions, helping to shape the future of the industry.</p>
            </section>

            <section className="my-5">
                <h2 className="text-purple text-2xl font-headlines">How It Works</h2>
                <article>
                    <p>
                        As a mentor, you'll have the flexibility to set your availability and define the
                        number of mentorship sessions you can offer. Students will have access to our
                        scheduling tool, which allows them to book sessions based on their preferred
                        dates and times. The scheduling tool prioritizes their availability, ensuring a
                        seamless and efficient matching process.
                    </p>
                </article>

                <article className="my-5">
                    <h2 className="text-purple text-2xl font-headlines">Benefits of Being a Mentor</h2>
                    <p>By becoming a mentor, you have the chance to:</p>
                </article>

                <article className="my-5">
                    <h4 className="text-purple text-2xl font-headlines">Make a Difference</h4>
                    <p>
                        Share your knowledge, experience, and insights to help aspiring software
                        engineers succeed in technical interviews. Your guidance can have a significant
                        impact on their career trajectories.
                    </p>
                </article>

                <article className="my-5">
                    <h4 className="text-purple text-2xl font-headlines">Enhance Your Leadership Skills</h4>
                    <p>
                        Mentoring provides an opportunity to sharpen your leadership, communication,
                        and coaching abilities. By guiding students through their interview preparation,
                        you'll further develop your own skills as well.
                    </p>
                </article >
                <article className="my-5">
                    <h4 className="text-purple text-2xl font-headlines">Stay Connected with Academia</h4>
                    <p>
                        Engaging with students and academia keeps you informed about the latest
                        trends, technologies, and challenges in the field. It offers a chance to exchange
                        ideas and perspectives with the next generation of professionals.
                    </p>
                </article>

                <article className="my-5">
                    <h4 className="text-purple text-2xl font-headlines">Networking Opportunities</h4>
                    <p>
                        Our Mentorship Service fosters a community of industry professionals
                        committed to helping students succeed. You'll have the chance to connect with
                        like-minded individuals, potentially forming valuable professional connections.
                    </p>
                </article>

                <article className="my-5">
                    <h4 className="text-purple text-2xl font-headlines">Personal Fulfillment</h4>
                    <p>
                        The satisfaction of empowering others to achieve their goals is immeasurable.
                        Mentoring allows you to give back to the community and nurture future talent.
                    </p>
                </article>

                <h2 className="text-purple text-2xl font-headlines">Join Our Mentorship Service</h2>
                <article>
                    <p>
                        If you're passionate about helping students succeed and making a positive impact on their career
                        journeys, we invite you to join our Mentorship Service. Your expertise and guidance will be invaluable in
                        preparing CS students for technical interviews and equipping them with the skills they need to thrive in
                        the industry.
                        <br />
                        To get started, simply sign up as a mentor on our platform. Once approved, you can set your availability
                        and start offering mentorship sessions. Our scheduling tool will handle the matching process, ensuring
                        that you connect with motivated students seeking your guidance.
                        <br />
                        Thank you for considering becoming a mentor with our Mentorship Service. Together, let's empower
                        the next generation of software engineers and shape the future of the industry!
                    </p>
                </article>
            </section>
        </div>
    );
}
