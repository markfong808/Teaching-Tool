/* MeetingLocation.js
 * Last Edited: 3/9/24
 *
 * Entry Field UI for the physical_location, virtual_link,
 * and class_recordings_link for programs
 *
 * Known bugs:
 * - Set Office Location label for the object is outdated
 *
 */

export default function MeetingLocation({
  isClassLocation,
  param,
  data,
  disabled,
}) {
  ////////////////////////////////////////////////////////
  //                 Handler Functions                  //
  ////////////////////////////////////////////////////////

  // passing entry of location and links for programs
  // back to Program.js
  const handleInputChange = (e) => {
    param.functionPassed({
      target: {
        name: e.target.name,
        value: e.target.value,
      },
    });
    param.changesMade(true);
  };

  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  // conditional rendering of boxes if isClassLocation is true or not
  return (
    <div className={isClassLocation ? "w-2/3 m-auto" : "w-full m-auto"}>
      <div
        className={
          isClassLocation
            ? "flex flex-col p-5 border border-light-gray rounded-md shadow-md mt-5"
            : "flex flex-row p-5 border border-light-gray rounded-md shadow-md m-auto mt-5 justify-between"
        }
      >
        <div className="flex">
          <label className="whitespace-nowrap font-bold text-2xl mb-2">
            Set Program Location:
          </label>
        </div>
        <div
          className={
            isClassLocation
              ? "flex flex-row items-center mb-2"
              : "flex flex-row items-center mb-1"
          }
        >
          <label
            className={
              isClassLocation ? "whitespace-nowrap" : "whitespace-nowrap ml-2"
            }
          >
            In-Person Location:
          </label>
          <input
            className="border border-light-gray ml-2 w-40 hover:bg-gray"
            name={isClassLocation ? "physical_location" : "physical_location"}
            value={
              isClassLocation
                ? data.physical_location ?? ""
                : data.physical_location ?? ""
            }
            onChange={handleInputChange}
            disabled={disabled}
          />
        </div>
        <div
          className={
            isClassLocation
              ? "flex flex-row items-center mb-2"
              : "flex flex-row items-center mb-1"
          }
        >
          <label
            className={
              isClassLocation ? "whitespace-nowrap" : "whitespace-nowrap"
            }
          >
            Virtual Meeting Link:
          </label>
          <input
            className="border border-light-gray ml-2 w-40 hover:bg-gray"
            name={isClassLocation ? "virtual_link" : "virtual_link"}
            value={
              isClassLocation
                ? data.virtual_link ?? ""
                : data.virtual_link ?? ""
            }
            onChange={handleInputChange}
            disabled={disabled}
          />
        </div>

        {isClassLocation && (
          <div>
            <label className="whitespace-nowrap">Course Recordings Link:</label>
            <input
              className="border border-light-gray ml-2 w-40 hover:bg-gray"
              name="class_recordings_link"
              value={data.class_recordings_link ?? ""}
              onChange={handleInputChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
