// @see https://docs.aircode.io/guide/functions/
const aircode = require('aircode');
const bcrypt = require('bcrypt');

module.exports = async function (params, context) {

  const { firstname, lastname, email, password } = params
  if(!firstname || !lastname || !email || !password){
    return{
      "message": "All fields are required!"
    }
  }

  const adminTable = aircode.db.table('admin');

  const adminExist = await adminTable.where({email}).findOne()

  if(adminExist){
    context.status(409);
    return {
      "message" : "An Admin user with the provided info already exist!"
    }
  }


  try{
    const count = await adminTable.where().count()

    //password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = { firstname, lastname, "password" : hashedPassword, "isAdmin" : true, email };

    if(!(count === 0)){
      return {
        "message": "Contact current Admin to open your Admin account!"
      }
    }

    await adminTable.save(newAdmin)

    const result = await adminTable.where({email}).projection({ password: 0, isAdmin: 0 }).find()
    context.status(201);
    return{
      ...result
    }
  }catch(err){
    context.status(500);
    return{
      "message": err.message
    }
  }
 
};
