/* checkUser.js
 * Last Edited: 3/26/24
 *
 * Helper file to check if a user is valid
 *
 * Known bugs:
 * -
 *
 */

////////////////////////////////////////////////////////
//                 Handler Functions                  //
////////////////////////////////////////////////////////

// check if a user isnt an admin
export function isnt_Admin(user) {
  return user.account_type !== "admin";
}

// check if a user isnt an instructor
export function isnt_Instructor(user) {
  return user.account_type !== "instructor";
}

// check if a user isnt a student
export function isnt_Student(user) {
  return user.account_type !== "student";
}

// check if a user isnt any role
export function isnt_User(user) {
  return isnt_Admin(user) && isnt_Instructor(user) && isnt_Student(user);
}

// check if a user isnt a student or instructor
export function isnt_Student_Or_Instructor(user) {
  return isnt_Student(user) && isnt_Instructor(user);
}
