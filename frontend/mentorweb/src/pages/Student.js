import React, { useState } from "react";
import StudentContent from "../components/StudentContent";
import ScheduleSession from "../components/ScheduleSession";
import Meetings from "../components/Meetings";
import Profile from "../components/Profile";

export default function Student() {
    const [content, setContent] = useState('default'); 

    const renderContent = () => {
        switch (content) {
            case 'meetings':
                return <Meetings />;
            case 'profile':
                return <Profile />;
            case 'schedule':
                return <ScheduleSession />;
            default:
                return <StudentContent />;
        }
    };

    return <StudentContent />;
}