// @see https://docs.aircode.io/guide/functions/
const aircode = require('aircode');
const bcrypt = require('bcrypt');
const { sign }=require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv')


module.exports = async function (params, context) {
const { email, password } = params;
if( !email, !password ){
  context.status(400);
  return { "message": "All fields are required!" }
}
// console.log(`The email is ${email} and the password is ${password}`)

 const userTable = aircode.db.table('user');
  const user = await userTable.where({ email }).findOne();
  if(!user){
    context.status(401)
    return {"message": "Email or password is not valid!"}
  }
  const matchPassword = await bcrypt.compare(password, user.password)
  if(matchPassword){
    const accessToken = jwt.sign({
      "id": user._id,
      "level": user.level,
      "isAdmin": user.isAdmin
    },
    process.env.ACCESS_TOKEN,
    { expiresIn: '1h' });

    const currentUser = { ...user, accessToken };
    await userTable.save(currentUser);
    context.status(200);
    return { accessToken }
  } else {
    context.status(401)
    return {"message": "Email or password is not valid!"}
  }
    
  // return { "message": "You're in now!" }
  
  
};
