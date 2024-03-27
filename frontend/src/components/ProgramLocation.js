/* ProgramLocation.js
 * Last Edited: 3/24/24
 *
 * Entry Field UI for the physical_location, meeting_url,
 * and recordings_link for programs
 *
 * Known bugs:
 * - Redo UI when isCourseInfoProgram is true
 *
 */

export default function ProgramLocation({
  isCourseInfoProgram,
  functions,
  data,
}) {
  ////////////////////////////////////////////////////////
  //                 Handler Functions                  //
  ////////////////////////////////////////////////////////

  // passing entry of location and links for programs
  // back to Program.js
  const handleInputChange = (e) => {
    functions.inputChangeFunction({
      target: {
        name: e.target.name,
        value: e.target.value,
      },
    });
  };

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  // conditional rendering of boxes if isCourseLocation is true or not
  return (
    <div className={"w-full m-auto"}>
      <div className={isCourseInfoProgram ? "flex flex-col p-5 border border-light-gray rounded-md shadow-md mt-5"
      : "flex flex-row p-5 border border-light-gray rounded-md shadow-md m-auto mt-5 justify-between"}>

        <div className="flex relative">
          <label className="whitespace-nowrap font-bold text-2xl mb-2"> {isCourseInfoProgram ? "Set Course Details:" : "Set Program Location:"}</label>
      
        {isCourseInfoProgram && (
          <div className="absolute right-0 top-2 flex flex-row items-center mb-2">
            <label className="whitespace-nowrap">Quarter:</label>
            <select
              className="border border-light-gray rounded ml-2 hover:bg-gray hover:cursor-pointer"
              name={"quarter"}
              value={data.quarter ?? ""}
              onChange={handleInputChange}
              onBlur={functions.saveChangeFunction}
            >
              <option className="bg-white" key="" value="">
                Select...
              </option>
              <option className="bg-white" key="Fall" value="Fall">
                Fall
              </option>
              <option className="bg-white" key="Winter" value="Winter">
                Winter
              </option>
              <option className="bg-white" key="Spring" value="Spring">
                Spring
              </option>
              <option className="bg-white" key="Summer" value="Summer">
                Summer
              </option>
            </select>
          </div>
        )}
      </div>

    <div className ="flex flex-row relative">
        <div className={isCourseInfoProgram ? "flex flex-row items-center mb-2": "flex flex-row items-center mb-1"}>
          <label className={isCourseInfoProgram? "whitespace-nowrap": "whitespace-nowrap ml-2"}>In-Person Location:</label>
          <input
            className="border border-light-gray ml-2 w-40 hover:bg-gray"
            name={"physical_location"}
            value={data.physical_location ?? ""}
            onChange={handleInputChange}
            onBlur={functions.saveChangeFunction}
          />
        </div>
        
        
        <div className={isCourseInfoProgram ? "absolute right-0 flex flex-row items-center mb-2": "flex flex-row items-center mb-1"}>
          <label className={"whitespace-nowrap"}>Virtual Meeting Link:</label>
          <input
            className="border border-light-gray ml-2 w-40 hover:bg-gray"
            name={"meeting_url"}
            value={data.meeting_url ?? ""}
            onChange={handleInputChange}
            onBlur={functions.saveChangeFunction}
          />
        </div>
      </div>

        {isCourseInfoProgram && (
          <>
            <div className="flex flex-row items-center mb-2 relative">
                <label className="whitespace-nowrap">Course Recordings Link:</label>
                <input
                  className="border border-light-gray ml-2 w-40 hover:bg-gray"
                  name="recordings_link"
                  value={data.recordings_link ?? ""}
                  onChange={handleInputChange}
                  onBlur={functions.saveChangeFunction}
                />
              
              <div className="absolute right-0">
                <label className="whitespace-nowrap">Discord Link:</label>
                <input
                  className="border border-light-gray ml-2 w-40 hover:bg-gray"
                  name="discord_link"
                  value={data.discord_link ?? ""}
                  onChange={handleInputChange}
                  onBlur={functions.saveChangeFunction}
                />
              </div>
              </div>
          </>
        )}
      </div>
    </div>
  );
}
