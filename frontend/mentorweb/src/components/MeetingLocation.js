export default function MeetingLocation({isClassLocation, isClassTime, param, data }) {

    /////////////////////////////////////////////
    //        Handling Input Function          //
    /////////////////////////////////////////////
    
    // passing entry of location and links for class and office hours
    // back to ClassDetails object 
    const handleInputChange = (e) => {
        param.functionPassed({target: {
            name: e.target.name,
            value: e.target.value
        }});
        param.changesMade(true);
    };

    // HTML for webpage
    // conditional rendering of boxes if isClassLocation is true or not
    return (
        <div className={isClassTime ? "w-2/3 m-auto": "w-full m-auto"}>
            <div className={isClassTime ? "flex flex-col p-5 border border-light-gray rounded-md shadow-md mt-5":"w-3/4 flex flex-row p-5 border border-light-gray rounded-md shadow-md m-auto mt-5 justify-between"}>
                <div className='flex'>
                    <label className='whitespace-nowrap font-bold text-2xl mb-2'>{isClassLocation ? "Set Class Location:" : "Set Office Location:"}</label>
                </div>
                <div className={isClassTime ? "flex flex-row items-center mb-2" : "flex flex-row items-center mb-1"}>
                    <label className={isClassTime ? "whitespace-nowrap":"whitespace-nowrap ml-2"}>Location:</label>
                        <input className='border border-light-gray ml-2 w-40'
                            name = {isClassLocation ? "physical_location" : "physical_location"}
                            value= {isClassLocation ? data.physical_location ?? '' : data.physical_location ?? ''}
                            onChange={handleInputChange}
                        />
                </div>
                <div className={isClassTime ? "flex flex-row items-center mb-2" : "flex flex-row items-center mb-1"}>
                    <label className={isClassTime ? "whitespace-nowrap": "whitespace-nowrap"}>Virtual Meeting Link:</label>
                        <input className='border border-light-gray ml-2 w-40'
                            name={isClassLocation ? "virtual_link" : "virtual_link"}
                            value={isClassLocation ? data.virtual_link ?? '' : data.virtual_link ?? ''}
                            onChange={handleInputChange}
                        />
                </div>
                    
                {isClassLocation && (
                    <div>
                        <label className="whitespace-nowrap">Class Recordings Link:</label>
                        <input
                            className='border border-light-gray ml-2 w-40'
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