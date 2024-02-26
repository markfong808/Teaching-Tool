import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { capitalizeFirstLetter, formatDate } from '../utils/FormatDatetime';
import { getCookie } from '../utils/GetCookie';
import { Tooltip } from './Tooltip';

export default function ProfileSettings() {
    const csrfToken = getCookie('csrf_access_token');
    const { user, setUser } = useContext(UserContext);
    const [textBoxShown, setTextBoxShown] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        pronouns: user?.pronouns || 'Undefined',
        title: user?.title || '',
        discord_id: user?.discord_id || '',
        about: user?.about || '',
        linkedin_url: user?.linkedin_url || '',
        meeting_url: user?.meeting_url || '',
    });

    const [pronounsType, setPronounsType] = useState('');
    const [pronounsUserInput, setPronounsUserInput] = useState('');
    const [changesMade, setChangesMade] = useState(false);

    useEffect(() => {
        // Update form data when user context updates
        if (user) {
            setFormData({
                name: user.name || '',
                pronouns: user.pronouns || 'Undefined',
                title: user.title || '',
                discord_id: user.discord_id || '',
                about: user.about || '',
                linkedin_url: user.linkedin_url || '',
                meeting_url: user.meeting_url || '',
            });

            console.log(user.pronouns);

            if (user.pronouns !== "Undefined" || user.pronouns !== "He/Him" || user.pronouns !== "She/Her" || user.pronouns !== "They/Them") {
                console.log("HIT");
                setPronounsType("Other");
                setPronounsUserInput(user.pronouns);
            } else { // could have bug
                console.log("PASS");
                setPronounsType(user.pronouns);
                setPronounsUserInput('');
            }
        }
    }, [user]);


    useEffect(() => {
        console.log("USE EFFECT: ", formData);
    }, [formData]);

    useEffect(() => {
        console.log("Type: ", pronounsType);
    }, [pronounsType]);

    useEffect(() => {
        console.log("userInput: ", pronounsUserInput);
    }, [pronounsUserInput]);


    useEffect(() => {
        if (user) {
            //fetchLimits();
        }
    }, [user]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;


        if (newValue === "Undefined") {
            return;
        }

        if (name === "pronouns" && pronounsType === "Other" && pronounsUserInput !== '') {
            setFormData({ ...formData, [name]: pronounsUserInput });
        } else {
            setFormData({ ...formData, [name]: newValue });
        }


        // Check if changes were made
        const formIsSameAsUser = (
            (name === 'name' && value === user.name) ||
            (name === 'about' && value === user.about) ||
            (name === 'pronouns' && value === user.pronouns) ||
            (name === 'title' && value === user.title) ||
            (name === 'discord_id' && value === user.discord_id) ||
            (name === 'linkedin_url' && value === user.linkedin_url) ||
            (name === 'meeting_url' && value === user.meeting_url)
        );

        // Set changesMade to true if form data does not match initial user data
        setChangesMade(!formIsSameAsUser);
    };

    useEffect(() => {
        if (pronounsType === "Other") {
            setTextBoxShown(true);
        } else {
            setTextBoxShown(false);
        }
    }, [pronounsType]);

    const handleCancelChanges = () => {
        // Reset form data to initial user data
        setFormData({
            name: user.name || '',
            pronouns: user.pronouns || '',
            title: user.title || '',
            discord_id: user.discord_id || '',
            about: user.about || '',
            linkedin_url: user.linkedin_url || '',
            meeting_url: user.meeting_url || '',
        });
        setChangesMade(false); // Reset changes made
    };

    const handleSaveChanges = async () => {
        try {
            const response = await fetch('/profile/update', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Profile update failed');
            }

            setChangesMade(false); // Reset changes made
            // Update the user context with the new data
            const updatedUser = await response.json();
            setUser(updatedUser);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };


    if (!user) {
        return <div>Loading user data...</div>;
    }

    return (
        <div className="flex flex-col w-2/3 m-auto">
            <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md">
                <h2 className='pb-10 text-center font-bold text-2xl'>Account Settings</h2>
                <div className="flex flex-col">

                    <div>
                        <label className='font-bold'>Name &nbsp;</label>
                        <Tooltip text="Alias users will see you as (Title + Name). Enter name you want to be seen as (First Name + Last Name, First Name only, Last Name only)">
                            <span>ⓘ</span>
                        </Tooltip>
                    </div>

                    <input className='border border-light-gray mb-3'
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                    />

                    <div>
                        <label className='font-bold inline-block'>Pronouns</label>
                        <select
                            className="border border-light-gray rounded ml-2"
                            name="pronouns"
                            value={pronounsType}
                            onChange={handleInputChange}
                        >
                            <option key="Undefined" value="Undefined">Select...</option>
                            <option key="He/Him" value="He/Him"> He/Him</option>
                            <option key="She/Her" value="She/Her">She/Her</option>
                            <option key="They/Them" value="They/Them">They/Them</option>
                            <option key="Other" value="Other">Other</option>
                        </select>
                        {textBoxShown && (
                            <input className='border border-light-gray ml-2 mt-1'
                                name="pronouns"
                                value={pronounsUserInput}
                                onChange={(e) => setPronounsUserInput(e.target.value)}
                                onBlur={() => handleInputChange({ target: { name: "pronouns", value: pronounsUserInput } })}
                            />
                        )}
                    </div>

                    {user?.account_type === 'mentor' && (
                        <div className='mt-3'>
                            <label className='font-bold inline-block'>Title</label>
                            <select
                                className="border border-light-gray rounded ml-2"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                            >
                                <option key={-1} value=''>No Title...</option>
                                <option key={"Prof."} value="Prof.">Prof.</option>
                                <option key={"Dr."} value="Dr.">Dr.</option>
                                <option key={"Mr."} value="Mr.">Mr.</option>
                                <option key={"Mrs."} value="Mrs.">Mrs.</option>
                                <option key={"Ms."} value="Ms.">Ms.</option>

                            </select>
                        </div>
                    )}


                    <label className='font-bold mt-3'>Email</label>
                    <input className='bg-gray border border-light-gray mb-3'
                        name='email'
                        value={user?.email}
                        disabled
                    />

                    <label className='font-bold'>Discord ID</label>
                    <input className=' border border-light-gray mb-3'
                        name='discord_id'
                        value={formData.discord_id}
                        onChange={handleInputChange}
                    />

                    <label className='font-bold'>Account Type</label>
                    <input className='bg-gray border border-light-gray mb-3'
                        name='type'
                        value={capitalizeFirstLetter(user?.account_type)}
                        disabled
                    />


                    <div>
                        <label className='font-bold'>Your Personal Meeting URL&nbsp;</label>
                        <Tooltip text="Please provide only one URL of your choice - Zoom, Teams, etc.">
                            <span>
                                ⓘ
                            </span>
                        </Tooltip>
                    </div>

                    <input className='border border-light-gray'
                        type="text"
                        name="meeting_url"
                        value={formData.meeting_url}
                        onChange={handleInputChange}
                    />

                    {changesMade && (
                        <div className="flex flex-row justify-end my-5">
                            <button className="bg-purple text-white rounded-md p-2 mr-2 hover:text-gold" onClick={handleSaveChanges}>Save Account Changes</button>
                            <button className="bg-purple text-white rounded-md p-2 hover:text-gold" onClick={handleCancelChanges}>Discard Account Changes</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}