import React, { useState, useEffect } from 'react';
import { getCookie } from '../utils/GetCookie';

const ManagePrograms = () => {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAddingNewProgram, setIsAddingNewProgram] = useState(false);
    const [selectedProgramType, setSelectedProgramType] = useState(null);
    const csrfToken = getCookie('csrf_access_token');

    // State for the form (used for both adding and updating)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: '',
    });
    const [changesMade, setChangesMade] = useState(false);

    useEffect(() => {
        if (selectedProgramType) {
            setFormData({
                name: selectedProgramType.name || '',
                description: selectedProgramType.description || '',
                duration: selectedProgramType.duration || '',
            });
            setChangesMade(false);
        }
    }, [selectedProgramType]);

    // Fetch programs from the backend
    const fetchPrograms = async () => {
        setLoading(true);
        try {
            const response = await fetch('/programs', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Include the CSRF token in the headers
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'include', // Make sure to use credentials: 'include' for cookies
            });
            if (!response.ok) {
                throw new Error('Error fetching programs');
            }
            let data = await response.json();
            data = data.sort((a, b) => a.name.localeCompare(b.name));
            setPrograms(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Call fetchPrograms when the component mounts
    useEffect(() => {
        fetchPrograms();
    }, []);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setChangesMade(true);
    };

    const handleNewProgramClick = () => {
        setIsAddingNewProgram(true);
        setSelectedProgramType(null);
        setFormData({ name: '', description: '', duration: '' });
    };

    const handleAddProgram = async () => {
        const url = '/program';
        try {
            const response = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                // setSelectedProgramType(data);
                setIsAddingNewProgram(false);
                setChangesMade(false);
                alert('Program added successfully!');
                fetchPrograms(); // Refresh programs list
            } else {
                throw new Error('Error submitting form');
            }
        } catch (error) {
            setError(error.message);
        }
    }

    const renderNewProgramForm = () => {
        if (!isAddingNewProgram) {
            return null;
        }

        const isFormComplete = formData.name && formData.description && formData.duration;

        return (
            <div className="flex flex-col p-5 w-2/3 m-auto border border-light-gray rounded-md shadow-md">
                <div className="flex flex-row">
                    <h2 className='font-bold m-auto text-2xl'>Add Details Here</h2>
                    <div className="cursor-pointer" onClick={() => setIsAddingNewProgram(false)}>
                        <i className="fas fa-times"></i>
                    </div>
                </div>
                <div className='flex flex-col'>
                    <label className='font-bold'>
                        Name
                    </label>
                    <input className='border border-light-gray mb-3'
                        type='text'
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                    <label className='font-bold'>
                        Description
                    </label>
                    <textarea className='border border-light-gray mb-3'
                        name='description'
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                    />
                    <label className='font-bold'>
                        Duration (mins)
                    </label>
                    <input className='border border-light-gray mb-3 w-[100px]'
                        type='number'
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                {isFormComplete && (
                    <div className='flex justify-end'>
                        <button className="bg-purple text-white p-2 rounded-md" onClick={handleAddProgram}>Submit</button>
                    </div>
                )}
            </div>
        );
    };

    // Submit form for creating or updating a program
    const handleSaveChanges = async (e) => {
        if (!selectedProgramType) return;

        const url = `/program/${selectedProgramType.id}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSelectedProgramType({ ...selectedProgramType, ...formData });
                setChangesMade(false);
                alert('Program updated successfully!');
                fetchPrograms(); // Refresh programs list
            } else {
                throw new Error('Error submitting form');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleProgramTypeClick = (programType) => {
        setSelectedProgramType(programType);
    };

    // Delete a program
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this program?')) {
            try {
                const response = await fetch(`/program/${id}`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                    },
                });

                if (response.ok) {
                    alert('Program deleted successfully!');
                    setSelectedProgramType(null);
                    fetchPrograms(); // Refresh programs list
                } else {
                    throw new Error('Error deleting program');
                }
            } catch (error) {
                setError(error.message);
            }
        }
    };

    const handleCancelChanges = () => {
        // Reset form data to initial meeting data
        setFormData({
            name: selectedProgramType.name || '',
            description: selectedProgramType.description || '',
            duration: selectedProgramType.duration || '',
        });
        setChangesMade(false); // Reset changes made
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const renderProgramTypeDetails = () => {
        if (!selectedProgramType) {
            return null;
        }

        return (
            <div className="flex flex-col w-2/3 m-auto p-5 border border-light-gray rounded-md shadow-md">
                <div className="flex flex-row">
                    <h2 className='font-bold text-2xl m-auto'>Details</h2>
                    <div className="cursor-pointer" onClick={() => setSelectedProgramType(null)}>
                        <i className="fas fa-times"></i>
                    </div>
                </div>
                <div className='flex justify-end'>
                    <button className='bg-purple text-white hover:text-gold p-2 rounded-md' onClick={() => handleDelete(selectedProgramType.id)}>Delete Program</button>
                </div>
                <div className='flex flex-col'>
                    <label className='font-bold'>
                        Name
                    </label>
                    <input className='border border-light-gray mb-3'
                        type='text'
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                    />
                    <label className='font-bold'>
                        Description
                    </label>
                    <textarea className='border border-light-gray mb-3'
                        name='description'
                        value={formData.description}
                        onChange={handleInputChange}
                    />
                    <label className='font-bold'>
                        Duration (mins)
                    </label>
                    <input className='border border-light-gray mb-3'
                        type='number'
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                    />
                </div>
                {changesMade && (
                    <div className="flex justify-end">
                        <button className='bg-purple text-white hover:text-gold p-2 rounded-md' onClick={handleSaveChanges}>Save Changes</button>
                        <button className='bg-purple text-white hover:text-gold p-2 ml-2 rounded-md' onClick={handleCancelChanges}>Cancel Changes</button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className='w-2/3 m-auto'>
            {selectedProgramType ? renderProgramTypeDetails() : renderNewProgramForm()}
            {!selectedProgramType && !isAddingNewProgram && (
                <div>
                    <h1 className='text-center text-2xl font-bold'>Manage Programs</h1>
                    <div className='flex justify-end my-5'>
                        <button className='bg-purple text-white hover:text-gold p-2 rounded-md' onClick={handleNewProgramClick}>Add New Program</button>
                    </div>
                    <table className='border m-auto w-full'>
                        <thead className='bg-purple text-white'>
                            <tr>
                                <th className='border-r text-start'>Name</th>
                                <th className='border-r text-start'>Description</th>
                                <th className='border-r text-start'>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {programs.map((program) => (
                                <tr className="border-b" key={program.id} onClick={() => handleProgramTypeClick(program)}>
                                    <td className='border-r underline text-blue cursor-pointer'>{program.name}</td>
                                    <td className='border-r'>{program.description}</td>
                                    <td className='border-r'>{program.duration} mins</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManagePrograms;
