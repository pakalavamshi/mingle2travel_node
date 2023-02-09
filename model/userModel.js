var userModelSchema = require('../schema/userSchema')

const bcrypt = require('bcryptjs')
const saltval = 10
var ObjectId = require('mongoose').Types.ObjectId;
function userModel() {

}
userModel.prototype.UserCreation = function (data, callback) {
  bcrypt.genSalt(saltval, (err, salt) => {
    if (err) {
      console.log(err)
    } else {
      bcrypt.hash(data.password, salt, (err, hashpassword) => {
        if (err) {
          console.log(err)
        } else {
          data.password = hashpassword
          var user = new userModelSchema(data)
          user.save(user, callback)
        }
      })
    }
  })
}
userModel.prototype.findemail = function (data, callback) {
  userModelSchema.find({ email: data }, callback)
}
userModel.prototype.comparePassword = (password, hashpassword, cb) => {
  console.log(password, hashpassword)
  bcrypt.compare(password, hashpassword, cb)

}
userModel.prototype.hashpassword = (password, cb) => {
  bcrypt.genSalt(saltval, (err, salt) => {
    if (err) {
      return cb(err)
    }
    else {

      bcrypt.hash(password, salt, cb)
    }
  })
}
userModel.prototype.updatepassword = (data, cb) => {
  bcrypt.genSalt(saltval, (err, salt) => {

    if (err) {
      console.log(err)
    } else {
      bcrypt.hash(data.newpassword, salt, (err, hashpassword) => {
        if (err) {
          console.log(err)
        }
        else {
          //console.log(hashpassword)
          // User.updateOne({password:hashpassword},cb)
          userModelSchema.updateOne({ email: data.email }, { $set: { password: hashpassword } }, cb)

        }
      })
    }
  })
}



module.exports = userModel;