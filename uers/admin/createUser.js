const aircode = require('aircode');
const bcrypt = require('bcrypt');

let isHeadmaster = false;
let ictTeacher = false;
let subjectTeacher = false;
let permission = false;


module.exports = async function (params, context) {

 const { firstname, lastname, age, email, location, level, password } = params;

 if (!firstname || !lastname || !age || !email || !location || !level || !password) {
    return {
      message: 'All fields are required!',
    };
 }

  // const admin = aircode.db.admin.where('isAdmin')

  //   console.log(admin)
 const userTable = aircode.db.table('user');

 const userExist = await userTable.where({ email }).findOne();

 if (userExist) {
    context.status(409);
    return {
      message: 'User already exist!',
    };
 }

  // Check if the user is authorized to create an administrator account
  // if (!context.user.isAdmin) {
  //   context.status(403);
  //   return {
  //     message: 'You are not authorized to create an administrator account.',
  //   };
  // }

switch (level) {
  case 1:
    isHeadmaster = true;
    permission = "isHeadmaster";
    break;
  case 2:
    ictTeacher = true;
    permission = "ictTeacher";
    break;
  case 3:
    subjectTeacher = true;
    permission = "subjectTeacher";
    break;
  default:
    console.log("Invalid level");
}

 try {

    //password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      firstname,
      lastname,
      "password": hashedPassword,
      isAdmin: false,
      email,
      location,
      "level": permission
    };


    await userTable.save(newUser);
   
    const result = await userTable
      .where({ email })
      .projection({ password: 0, isAdmin: 0 })
      .findOne();
    

    console.log("The result is, ", result)
   
    context.status(201);
    return {
      ...result
    };
 } catch (err) {
    context.status(500);
    return {
      "message": err.message
    }
 }
}
