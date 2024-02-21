import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { formatTime, formatDate, getDayFromDate, capitalizeFirstLetter } from '../utils/FormatDatetime';
import { getCookie } from '../utils/GetCookie';

export default function ManageAvailability({ courseId }) {
    const { user } = useContext(UserContext);
    const [data, setData] = useState([]);

    const fetchAvailability = async () => {
        if (!user) return;

        try {
            const response = await fetch(`/mentor/availability/${encodeURIComponent(courseId)}`, {
                credentials: 'include',

            });

            const apiData = await response.json();

            const sortedData = (apiData['mentor_availability'] || []).sort((a, b) => {
                const dateTimeA = new Date(`${a.date}T${a.start_time}`);
                const dateTimeB = new Date(`${b.date}T${b.start_time}`);
                return dateTimeA - dateTimeB;
            });
            setData(sortedData);


        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    useEffect(() => {
        fetchAvailability();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (courseId !== null || courseId !== '') {
            fetchAvailability();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    const handleAvailabilityStatusChange = async (availabilityID, newStatus) => {
        const csrfToken = getCookie('csrf_access_token');
        const payload = {
            availability_id: availabilityID,
            status: newStatus,
        }
        try {
            const response = await fetch('/mentor/availability/status', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                if (response.status === 409) {
                    response.json().then(data => {
                        alert(`${data.error}. Please update your limits under profile before changing the status.`);
                    });
                } else {
                    throw new Error("Error changing account status");
                }
            } else {
                alert("Status changed successfully");
                fetchAvailability();
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleDeleteAvailability = async (availabilityId) => {
        if (window.confirm("Are your sure you want to delete this availability?")) {
            const deleteEndpoint = `/mentor/delete-availability/${availabilityId}`;

            const csrfToken = getCookie('csrf_access_token');
            try {
                const response = await fetch(deleteEndpoint, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    }
                });

                if (response.ok) {
                    alert("Availability deleted successfully!");
                    fetchAvailability();
                } else {
                    throw new Error("Error deleting availability");
                }
            } catch (error) {
                console.error("Error deleting availability:", error);
            }
        }
    }

    return (
        <div className="w-full m-auto">
            <div className='text-center font-bold text-2xl pb-5'>
                <h1>Manage Availability</h1>
            </div>

            <div className="border w-3/8 m-auto">
                <table className='w-full'>
                    <thead className='border-b border-light-gray bg-purple text-white'>
                        <td className='border-r border-light-gray'>Type</td>
                        <td className='border-r border-light-gray'>Class Name</td>
                        <td className='border-r border-light-gray'>Day</td>
                        <td className='border-r border-light-gray'>Date</td>
                        <td className='border-r border-light-gray'>Time (PST)</td>
                        <td className='border-r border-light-gray'>Status</td>
                        <td>Delete?</td>
                    </thead>
                    <tbody>
                        {data.map((availability) => (
                            <tr className='border'>
                                <td className='border-r'>{availability.type}</td>
                                <td className='border-r'>{availability.class_name}</td>
                                <td className='border-r'>{getDayFromDate(availability.date)}</td>
                                <td className='border-r'>{formatDate(availability.date)}</td>
                                <td className='border-r'>{formatTime(availability.start_time)} - {formatTime(availability.end_time)} </td>
                                <td className='border-r'>
                                    <select
                                        onChange={(e) => handleAvailabilityStatusChange(availability.id, e.target.value)}
                                        value="Change Availability Status"
                                    >
                                        <option value="">{capitalizeFirstLetter(availability.status)}</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </td>
                                <td><button onClick={() => handleDeleteAvailability(availability.id)}>Delete</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}