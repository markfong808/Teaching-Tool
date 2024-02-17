export default function MeetingLocation({isClassLocation, param, data }) {

    /////////////////////////////////////////////
    //        Handling Input Function          //
    /////////////////////////////////////////////
    
    // passing entry of location and links for class and office hours
    // back to ClassDetails object 
    const handleInputChange = (e) => {
        param.functionPassed({
            name: e.target.name,
            value: e.target.value
        });
        param.changesMade(true);
    };

    // HTML for webpage
    // conditional rendering of boxes if isClassLocation is true or not
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
                                value= {isClassLocation ? data.class_location ?? '' : data.office_hours_location ?? ''}
                                onChange={handleInputChange}
                            />
                    </div>
                    <div>
                        <label className="whitespace-nowrap">Virtual Meeting Link:</label>
                            <input className='border border-light-gray ml-2 w-40 mt-2'
                                name={isClassLocation ? "class_link" : "office_hours_link"}
                                value={isClassLocation ? data.class_link ?? '' : data.office_hours_link ?? ''}
                                onChange={handleInputChange}
                            />
                    </div>
                {isClassLocation && (
                    <div>
                        <label className="whitespace-nowrap">Class Recordings Link:</label>
                        <input
                            className='border border-light-gray ml-2 w-40 mt-2'
                            name="class_recordings_link"
                            value={data.class_recordings_link ?? ''}
                            onChange={handleInputChange}
                        />
                    </div>
                )}
                </div>
            </div>
    );
}