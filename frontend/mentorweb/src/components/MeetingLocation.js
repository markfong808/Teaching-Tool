import React, { useEffect, useState } from "react";

export default function MeetingLocation({isClassLocation, param, data, loadPage}) {
    const [boxShown, setBoxShown] = useState(false);

    const [formData, setFormData] = useState({
        class_location: '',
        office_hours_location: '',
        class_recordings_link: '',
        office_hours_link: ''
    });

    // Meeting Location show box
    const showBox = () => {
        if (boxShown) {
            setBoxShown(false);
        } else {
            setBoxShown(true);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        
        param.functionpassed({
            name: e.target.name,
            value: e.target.value
        });
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

            //console.log(formData.class_location);

            param.loadPageFunction(!loadPage);
        }
    }, [data, formData, param, loadPage, isClassLocation]);

    return (
        <div>
            <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
                <div className="flex items-center">
                    <label className="font-bold text-2xl">{isClassLocation ? "Set Class Location:" : "Set Office Location:"}</label>
                    <input type="checkbox" id="myCheckbox" class="form-checkbox h-5 w-5 text-blue-600 ml-5" checked={boxShown} onChange={showBox}></input>
                    <span className="px-2 py-2 text-sm font-normal">In-Person?</span>
                    {boxShown && (
                        <input className='border border-light-gray ml-2 text-sm font-normal'
                            name = {isClassLocation ? "class_location" : "office_hours_location"}
                            value= {isClassLocation ? formData.class_location : formData.office_hours_location}
                            onChange={handleInputChange}
                        />
                    )}
                </div>
            </div>
            <div className="flex flex-col w-2/3 p-5 m-auto border border-light-gray rounded-md shadow-md mt-5">
                <div className="flex items-center">
                    <label className="font-bold text-2xl">{isClassLocation ? "Class Recordings Link:" : "Virtual Meeting Link:"}</label>
                    <input className='border border-light-gray ml-2 text-sm font-normal'
                            name={isClassLocation ? "class_recordings_link" : "office_hours_link"}
                            value={isClassLocation ? formData.class_recordings_link : formData.office_hours_link}
                            onChange={handleInputChange}
                        />
                </div>
            </div>
        </div>

    );
}