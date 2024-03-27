/* Footer.js
 * Last Edited: 3/26/24
 *
 * Footer that displays name of author, year, and rights
 * at the bottom of a webpage.
 *
 * Known bugs:
 * -
 *
 */

export default function Footer() {
  ////////////////////////////////////////////////////////
  //                 Render Functions                   //
  ////////////////////////////////////////////////////////

  // HTML for webpage
  return (
    // Define Footer component
    <div className="flex bg-purple text-white items-stretch justify-center m-auto">
      <div className="p-1">
        {/* Footer which contains year, author, and rights reserved */}
        <footer className="mt-auto">
          &copy;{new Date().getFullYear()} UW Tech Prep. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
