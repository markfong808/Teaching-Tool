import React from "react";

export default function AdminContent() {
  return (
    <div className="flex flex-col w-2/3 m-auto">
      <h1 className="text-center text-4xl font-headlines text-purple">
        Welcome, Admin!
      </h1>
      <section className="">
        <p>
          As an administrator, you have full control over managing users,
          programs, and appointments within the TechPrep platform. Your role is
          crucial in ensuring the smooth operation and integrity of our system.
        </p>
      </section>

      <section className="pt-5">
        <h2 className="text-purple text-2xl font-headlines pb-5">
          Administrator Dashboard:
        </h2>
        <article className="pb-5">
          <h4 className="text-purple text-2xl font-headlines ">Manage Users</h4>
          <p>
            View and edit user accounts, including changing account statuses and
            types. You can activate, deactivate, or change the roles of users
            based on their engagement and compliance with our platform's
            policies.
          </p>
        </article>

        <article className="pb-5">
          <h4 className="text-purple text-2xl font-headlines">
            Program Management
          </h4>
          <p>
            Create, update, or delete different instructorship programs. Each
            program can be tailored to meet the evolving needs of our community,
            ensuring that we offer relevant and impactful instructorship
            opportunities.
          </p>
        </article>

        <article className="pb-5">
          <h4 className="text-purple text-2xl font-headlines">
            Appointment Oversight
          </h4>
          <p>
            Monitor scheduled appointments and their statuses. You have the
            ability to intervene in appointment scheduling if needed, ensuring
            that both instructors and students have a seamless experience.
          </p>
        </article>

        <article className="pb-5">
          <h4 className="text-purple text-2xl font-headlines">
            Analytics and Reports
          </h4>
          <p>
            Access detailed reports and analytics to gain insights into user
            engagement, program effectiveness, and overall platform performance.
            Use this data to make informed decisions and improvements.
          </p>
        </article>

        <article className="pb-5">
          <h4 className="text-purple text-2xl font-headlines">
            User Support and Queries
          </h4>
          <p>
            Handle support requests and queries from users. Your role is vital
            in providing timely assistance and resolving any issues users may
            face on the platform.
          </p>
        </article>
      </section>

      <p className="py-5">
        As an administrator, your role is instrumental in shaping the user
        experience on TechPrep. Your decisions and actions directly impact the
        effectiveness of our instructorship programs and the satisfaction of our
        users. We trust in your expertise and judgment to maintain the highest
        standards of quality and service on our platform.
      </p>
      <p>
        Utilize the tools and resources available to you to manage the platform
        efficiently. We are here to support you in your role as an administrator
        and ensure that TechPrep remains a leading destination for quality
        instructorship and learning.
      </p>
    </div>
  );
}
