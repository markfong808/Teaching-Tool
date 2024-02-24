import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Meetings from "./components/Meetings";
import CreateAvailability from "./components/CreateAvailability";
import ManageAvailability from "./components/ManageAvailability";
import ClassDetails from "./components/ClassDetails";
import ClassAvailability from "./components/ClassAvailability";
import Courses from "./components/Courses"
import ViewFeedback from "./components/ViewFeedback";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Student from "./pages/Student";
import Mentor from "./pages/Mentor";
import LoginSignup from "./pages/LoginSignup";
import RegisterForm from "./pages/RegisterForm";
import { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import Profile from "./components/Profile";
import Logout from "./components/Logout";
import Users from "./components/Users";
import ManagePrograms from "./components/ManagePrograms";
import ScheduleSession from "./components/ScheduleSession";
import ProtectedRoute from "./context/ProtectedRoute";
import Unauthorized from "./context/Unauthorized";
import { UserContext } from './context/UserContext';
import ManageTimes from "./components/ManageTimes";
import Program from "./components/Program"
import ProfileSettings from "./components/ProfileSettings";
function App() {
  const { user } = useContext(UserContext);


  return (
    <>
      <Navbar />
      <div id="container" className="">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/registerform" element={<RegisterForm />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin Routes */}
          <Route path="/admin"
            element={
              <ProtectedRoute allowedAccountTypes={['admin']}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/user-management"
            element={
              <ProtectedRoute allowedAccountTypes={['admin']}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/program-management"
            element={
              <ProtectedRoute allowedAccountTypes={['admin']}>
                <ManagePrograms />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/view-feedback"
            element={
              <ProtectedRoute allowedAccountTypes={['admin']}>
                <ViewFeedback />
              </ProtectedRoute>
            }
          />
          {/* Student Routes */}
          <Route path="/student"
            element={
              <ProtectedRoute allowedAccountTypes={['student']}>
                <Student />
              </ProtectedRoute>
            }
          />
          <Route path="/student/schedule-session"
            element={
              <ProtectedRoute allowedAccountTypes={['student']}>
                <ScheduleSession />
              </ProtectedRoute>
            }
          />
          <Route path="/student/meetings"
            element={
              <ProtectedRoute allowedAccountTypes={['student']}>
                <Meetings />
              </ProtectedRoute>
            }
          />
          <Route path="/student/courses"
            element={
              <ProtectedRoute allowedAccountTypes={['student']}>
                <Courses />
              </ProtectedRoute>
            }
          />

          {/* Mentor Routes */}
          <Route path="/mentor"
            element={
              <ProtectedRoute allowedAccountTypes={['mentor']}>
                <Mentor />
              </ProtectedRoute>
            }
          />
          <Route path="/mentor/meetings"
            element={
              <ProtectedRoute allowedAccountTypes={['mentor']}>
                <Meetings />
              </ProtectedRoute>
            }
          />
          <Route path="/mentor/add-availability"
            element={
              <ProtectedRoute allowedAccountTypes={['mentor']}>
                <CreateAvailability />
              </ProtectedRoute>
            }
          />
          <Route path="/mentor/manage-availability"
            element={
              <ProtectedRoute allowedAccountTypes={['mentor']}>
                <ManageAvailability />
              </ProtectedRoute>
            }
          />
          <Route path="/mentor/manage-times"
            element={
              <ProtectedRoute allowedAccountTypes={['mentor']}>
                <ManageTimes />
              </ProtectedRoute>
            }
          />
          <Route path="/mentor/edit-class-availability"
            element={
              <ProtectedRoute allowedAccountTypes={['mentor']}>
                <Program/>
              </ProtectedRoute>
            }
          />
          <Route path="/mentor/edit-class-details"
            element={
              <ProtectedRoute allowedAccountTypes={['mentor']}>
                <ClassDetails />
              </ProtectedRoute>
            }
          />
          <Route path="/profile"
            element={
              <ProtectedRoute allowedAccountTypes={['student', 'mentor', 'admin']}>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />
        </Routes>
        {/* <Footer /> */}
      </div>

    </>
  )
}

export default App