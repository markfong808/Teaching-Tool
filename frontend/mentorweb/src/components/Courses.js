import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { capitalizeFirstLetter } from '../utils/FormatDatetime';
import { getCookie } from '../utils/GetCookie';
import { Tooltip } from './Tooltip';
import Meetings from './Meetings';

export default function Courses() {
    const { user, setUser } = useContext(UserContext);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        about: user?.about || '',
        linkedin_url: user?.linkedin_url || '',
        meeting_url: user?.meeting_url || '',
        auto_approve_appointments: Boolean(user?.auto_approve_appointments),
    });

    useEffect(() => {
        // Update form data when user context updates
        if (user) {
            setFormData({
                name: user.name || '',
                about: user.about || '',
                linkedin_url: user.linkedin_url || '',
                meeting_url: user.meeting_url || '',
                auto_approve_appointments: Boolean(user.auto_approve_appointments),
            });
        }
    }, [user]);

    if (!user) {
        return <div>Loading user data...</div>;
    }

    return (
        <div className="flex flex-col w-7/8 m-auto">
            <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md">
                <h2 className='pb-10 text-center font-bold text-2xl'>CSS001: Class Name</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className='font-bold'>Class Times: <span style={{ fontWeight: 'normal' }}>Tuesday/Thursday 11:00am - 1:00pm</span></label>
                        <label className='font-bold'>Class Location: <span style={{ fontWeight: 'normal' }}>UW2-999 (in-person)</span></label>
                        <label className='font-bold'>Class Recordings Link: <span style={{ fontWeight: 'normal' }}>class-recordings-link.com/css001a-win23</span></label>
                        <label className='font-bold'>Comments: &nbsp; <p style={{ fontWeight: 'normal' }}></p></label>
                    </div>
                    <div className="flex flex-col justify-self-end">
                        <label className='font-bold'>Office Hours: <span style={{ fontWeight: 'normal' }}>Monday/Wednesday 1:00pm - 2:00pm</span></label>
                        <label className='font-bold'>Office Hours Location: <span style={{ fontWeight: 'normal' }}>UW1-921</span></label>
                        <label className='font-bold'>Instructor: <span style={{ fontWeight: 'normal' }}>Professor Williams: williams123@uw.edu</span></label>
                        <label className='font-bold'>Discord:  <span style={{ fontWeight: 'normal' }}>Discord: discord.com/css001</span></label>
                    </div>
                </div>
            </div>

            {/*REDO CSS CODE HERE*/}
            <div style={{ padding: '10px' }}>
            </div>

            {/* Second Box */}
            <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md">
                <Meetings />
            </div>

            <div style={{ padding: '10px' }}>
            </div>

            {/* Third Box */}
            <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md">
                <button className="bg-purple p-2 m-2 rounded-md text-white hover:text-gold" /*onClick={() => handleTabClick('upcoming') }*/>Schedule New Meeting</button >
            </div>
        </div >


    );
}
