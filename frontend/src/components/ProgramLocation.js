/* ProgramLocation.js
 * Last Edited: 3/26/24
 *
 * Entry Field UI for the quarter, physical_location, meeting_url,
 * recordings_link, and discord_link fields for programs. Not all
 * are available for the instructor to edit based on the program's type
 *
 * Known bugs:
 * -
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

  // pass attribute back to Program.js
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
  // conditional rendering of boxes if isCourseInfoProgram is true or not
  return (
    // Define ProgramLocation component 
    <div className={"w-full m-auto"}>
      {/* Creating box for Program Location based on if instructor selected Course Details or not as Program */}
      <div
        className={
          isCourseInfoProgram
            ? "flex flex-col p-5 border border-light-gray rounded-md shadow-md mt-5"
            : "flex flex-row p-5 border border-light-gray rounded-md shadow-md m-auto mt-5 justify-between"
        }
      >
        {/* Label to display to instructor if they choose Course Details or not as Program*/}
        <div className="flex relative">
          <label className="whitespace-nowrap font-bold text-2xl mb-2">
            {" "}
            {isCourseInfoProgram
              ? "Set Course Details:"
              : "Set Program Location:"}
          </label>

          {/* Display the Quarter label and selection menu if instructor chooses the Course Details Program*/}
          {isCourseInfoProgram && (
            <div className="absolute right-0 top-2 flex flex-row items-center mb-2">
              {/* Quarter label */}
              <label className="whitespace-nowrap">Quarter:</label>

              {/* Quarter selection */}
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

        {/* Display In-Person Location and Virtual Meeting Link to instructor regardless of Program*/}
        <div className="flex flex-row relative">
          <div
            className={
              isCourseInfoProgram
                ? "flex flex-row items-center mb-2"
                : "flex flex-row items-center mb-1"
            }
          >
            {/* In-Person Location label */}
            <label
              className={
                isCourseInfoProgram
                  ? "whitespace-nowrap"
                  : "whitespace-nowrap ml-2"
              }
            >
              In-Person Location:
            </label>

            {/* In-Person Location input field */}
            <input
              className="border border-light-gray ml-2 w-40 hover:bg-gray"
              name={"physical_location"}
              value={data.physical_location ?? ""}
              onChange={handleInputChange}
              onBlur={functions.saveChangeFunction}
            />
          </div>

          <div
            className={
              isCourseInfoProgram
                ? "absolute right-0 flex flex-row items-center mb-2"
                : "flex flex-row items-center mb-1"
            }
          >
            {/* Virtual Meeting Link label */}
            <label className={"whitespace-nowrap"}>Virtual Meeting Link:</label>

            {/* Virtual Meeting Link input field */}
            <input
              className="border border-light-gray ml-2 w-40 hover:bg-gray"
              name={"meeting_url"}
              value={data.meeting_url ?? ""}
              onChange={handleInputChange}
              onBlur={functions.saveChangeFunction}
            />
          </div>
        </div>
        
        {/* Display Course Recordings Link and Discord Link if instructor chooses Course Details as Program */}
        {isCourseInfoProgram && (
          <>
            {/* Course Recordings Link for instructor to enter and edit */}
            <div className="flex flex-row items-center mb-2 relative">
              {/* Course Recordings Link label */}
              <label className="whitespace-nowrap">
                Course Recordings Link:
              </label>

              {/* Course Recordings Link input field */}
              <input
                className="border border-light-gray ml-2 w-40 hover:bg-gray"
                name="recordings_link"
                value={data.recordings_link ?? ""}
                onChange={handleInputChange}
                onBlur={functions.saveChangeFunction}
              />

              {/* Discord Link for instructor to enter and edit */}
              <div className="absolute right-0">
                {/* Discord Link label */}
                <label className="whitespace-nowrap">Discord Link:</label>
                
                {/* Discord Link input field */}
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
