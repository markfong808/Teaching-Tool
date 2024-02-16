import React, { useEffect, useState } from "react";

export default function MeetingLocation({isClassLocation, param, data, loadPage, changes}) {
    const [boxShown, setBoxShown] = useState(false);

    const [formData, setFormData] = useState({
        class_location: '',
        office_hours_location: '',
        class_recordings_link: '',
        office_hours_link: '',
        class_link: ''
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        
        param.functionPassed({
            name: e.target.name,
            value: e.target.value
        });
        param.changesMade(true);
    };

    useEffect(() => {

        // if table should be loaded with values
        if (loadPage) {
            // load formData
            if (isClassLocation) {
                setFormData({
                    class_location: data.class_location,
                    class_recordings_link: data.class_recordings_link
                });
                if (data.class_location !== '') {
                    setBoxShown(true);
                }
            } else {
                setFormData({
                    office_hours_location: data.office_hours_location,
                    office_hours_link: data.office_hours_link
                });
                if (data.office_hours_location !== '') {
                    setBoxShown(true);
                }
            }

            param.loadPageFunction(!loadPage);
        }
    }, [data, formData, param, loadPage, isClassLocation]);

    return (
        <div className="w-2/3 m-auto">
            <div className="flex flex-col p-5 border border-light-gray rounded-md shadow-md mt-5">
                <div className="flex">
                    <label className="whitespace-nowrap font-bold text-2xl mb-2">{isClassLocation ? "Set Class Location:" : "Set Office Location:"}</label>
                </div>
                    <div className="flex flex-row ">
                        <label className="whitespace-nowrap">Location:</label>
                            <input className='border border-light-gray ml-2 w-40'
                                name = {isClassLocation ? "class_location" : "office_hours_location"}
                                value= {isClassLocation ? formData.class_location : formData.office_hours_location}
                                onChange={handleInputChange}
                            />
                    </div>
                    <div>
                        <label className="whitespace-nowrap">Virtual Meeting Link:</label>
                            <input className='border border-light-gray ml-2 w-40 mt-2'
                                name={isClassLocation ? "class_link" : "office_hours_link"}
                                value={isClassLocation ? formData.class_link : formData.office_hours_link}
                                onChange={handleInputChange}
                            />
                    </div>
                {isClassLocation && (
                    <div>
                        <label className="whitespace-nowrap">Class Recordings Link:</label>
                        <input
                            className='border border-light-gray ml-2  w-40 mt-2'
                            name="class_recordings_link"
                            value={formData.class_recordings_link}
                            onChange={handleInputChange}
                        />
                    </div>
                )}
                </div>
                   
            </div>
    
       
    );
}