/* Navbar.js
 * Last Edited: 3/24/24
 *
 * Navigation bar displayed on top of the webpage which has different tabs.
 * Once user clicks on a tab, they're redirected to a different webpage which
 * contains the contents of the tab.
 *
 * Known Bugs:
 * -
 *
 */
import React, { useContext } from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function Navbar() {
  // General Variables
  const { user } = useContext(UserContext);

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  return (
    <nav className="bg-purple text-white flex flex-row justify-between align-middle items-stretch gap-8 px-4 py-1">
      <Link to="/" className="text-4xl hover:text-gold font-headlines">
        UWTechPrep
      </Link>
      <ul className="flex gap-4 h-full">
        {!user && (
          <>
            <CustomLink to="/" className="hover:text-gold font-headlines">
              HOME
            </CustomLink>
            <CustomLink to="/login" className="hover:text-gold font-headlines">
              LOGIN
            </CustomLink>
            <CustomLink
              to="/registerform"
              className="hover:text-gold font-headlines"
            >
              REGISTER
            </CustomLink>
          </>
        )}
        {user && user.account_type === "admin" && (
          <>
            <CustomLink to="/admin" className="hover:text-gold font-headlines">
              HOME
            </CustomLink>
            <CustomLink
              to="/admin/user-management"
              className="hover:text-gold font-headlines"
            >
              MANAGE USERS
            </CustomLink>
            <CustomLink
              to="/admin/program-management"
              className="hover:text-gold font-headlines"
            >
              MANAGE PROGRAMS
            </CustomLink>
            <CustomLink
              to="/admin/view-feedback"
              className="hover:text-gold font-headlines"
            >
              VIEW FEEDBACK
            </CustomLink>
          </>
        )}
        {user && (
          <>
            {user.account_type === "student" && (
              <CustomLink
                to="/student"
                className="hover:text-gold font-headlines"
              >
                HOME
              </CustomLink>
            )}
            {user.account_type === "instructor" && (
              <CustomLink
                to="/instructor"
                className="hover:text-gold font-headlines"
              >
                HOME
              </CustomLink>
            )}

            {user.status === "active" && (
              <>
                {user.account_type === "student" && (
                  <>
                    <CustomLink
                      to="/student/courses"
                      className="hover:text-gold font-headlines"
                    >
                      COURSES
                    </CustomLink>
                  </>
                )}
                {user.account_type === "instructor" && (
                  <>
                    <CustomLink
                      to="/instructor/manage-times"
                      className="hover:text-gold font-headlines"
                    >
                      TIMES
                    </CustomLink>
                    <CustomLink
                      to="/instructor/edit-class-availability"
                      className="hover:text-gold font-headlines"
                    >
                      PROGRAM DETAILS
                    </CustomLink>
                  </>
                )}
              </>
            )}

            <CustomLink
              to="/profile"
              className="hover:text-gold font-headlines"
            >
              PROFILE
            </CustomLink>
            <CustomLink to="/logout" className="hover:text-gold font-headlines">
              LOGOUT
            </CustomLink>
          </>
        )}
      </ul>
    </nav>
  );
}

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <li className={isActive ? "text-gold underline" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  );
}
