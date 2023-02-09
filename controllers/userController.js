var userModel = require('../model/userModel')
um = new userModel()
const jwt = require('jsonwebtoken');
var db = require('../config/config')

const generator = require('generate-password');
const nodemailer = require('nodemailer');
userSchema = require('../schema/userSchema')
const async = require('async');
const config = require('../config/config')
const pushnotification = require('../config/pushnotification')

uniqid = require('uniqid');
var fs = require('fs');
var tokenverification = require('../utility/authantication.js');


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.forgotMailUsername, // Your email id
        pass: config.forgotMailPassword, // Your password
        // rejectUnauthorized: false
    }

})

function userController() {

}

//user create
userController.prototype.UserCreation = function (req, res) {
    if (req.body.name == undefined || req.body.name == "" || req.body.name == null) {
        res.status(200).json({ "status": 400, "err_filed": "user name require", "result": null })
    }
    if (req.body.email == undefined || req.body.email == '' || req.body.email == null) {
        res.status(200).json({ "status": 400, "err_filed": "Email  require", "result": null })
    }
    if (req.body.password == undefined || req.body.password == '' || req.body.password == null) {
        res.status(200).json({ "status": 400, "err_filed": "password require", "result": null })
    }
    um.findemail(req.body.email, (err, data) => {
        if (err) {
            res.status(200).json({ "status": 400, "err_field": "something went to wrong", "result": null })
        } else {
            if (data.length > 0) {
                res.status(200).json({ "status": 400, "err_field": "Email already exits", "result": null })
            } else {
                req.body.dimensionCount = 0;
                um.UserCreation(req.body, (err, response) => {
                    if (err) {
                        res.status(200).json({ "status": 400, "err_field": "something went to wrong", "result": null })
                    } else {
                        if (req.body.firebase_token) {
                            var title = "Welcome message";
                            var body = "Thanks for your registration. Your account has be created. Now start your journey towards building a global sustainability movement. Start building your network."
                            var page = "registration";
                            var page_sub = "user"
                            var obj = {
                                userId: response._id,
                                message: "Thanks for your registration. Your account has been created. Now start your journey towards building a global sustainability movement. Start building your network."
                            }
                            pushnotification.sendnotification(response._id, title, body, obj, "registration", "user")
                        }
                        var token = jwt.sign({ userid: response._id }, db.secret)
                        res.status(200).json({ "status": 200, "err_field": null, "message": "User registered successfully", "result": response, "token": token })
                    }
                })
            }
        }
    })
}



//user login
userController.prototype.UserLogin = function (req, res) {

    if (req.body.email == undefined || req.body.email == '' || req.body.email == null) {
        res.status(200).json({ "status": 400, "err_filed": "Email  require", "result": null })
    }
    if (req.body.password == undefined || req.body.password == '' || req.body.password == null) {
        res.status(200).json({ "status": 400, "err_filed": "password require", "result": null })
    }
    um.findemail(req.body.email, (err, data) => {

        if (err) {
            res.status(200).json({ "status": 400, "err_field": "something went to wrong", "result": null })
        } else {
            if (data == null || data.length <= 0) {
                res.status(200).json({ "status": 400, "err_field": "Entered Email  address is not registered with us", "result": null })
            } else {

                um.comparePassword(req.body.password, data[0].password, (err, ismatch) => {
                    if (err) {
                        res.status(200).json({ "status": 400, "err_field": "something went to wrong", "result": null })
                    } else {
                        if (ismatch) {
                            var obj = {
                                email: req.body.email,
                                firebase_token: req.body.firebase_token
                            }
                            um.EditProfile(obj, function (err, updated) {
                                if (!err) {

                                    var token = jwt.sign({ userid: data._id }, db.secret)
                                    res.status(200).json({ "status": 200, "err_field": null, "message": "User login sucessfully", "result": data, "token": token })
                                }

                            })

                        } else {
                            res.status(200).json({ "status": 400, "err_field": "Email  and Password does not match", "result": null })
                        }

                    }

                })
            }

        }
    })

}


userController.prototype.userforgotpassword = function (req, res) {
    if (req.body.email) {
        um.findemail(req.body.email, function (err, data) {
            if (data && data.length) {
                var val = Math.floor(1000 + Math.random() * 9000);
                var obj = {
                    email: req.body.email,
                    otp: val
                }
                um.EditProfile(obj, function (err, updateddata) {
                    if (updateddata.nModified == 1) {
                        var forgotpasswordtemplate = './mailtemplate/Forgotpassword.html';
                        var forgotpasswordtemplate = fs.readFileSync(forgotpasswordtemplate, "utf8");
                        forgotpasswordtemplate = forgotpasswordtemplate.replace("##UserName##", data[0].name);
                        forgotpasswordtemplate = forgotpasswordtemplate.replace("##otp##", val);

                        var mailOptions = {
                            from: '"See Wheelers"<shiva.seewheelers@gmail.com>', // sender address
                            to: req.body.email, // list of receivers
                            subject: 'Change password', // Subject line
                            text: "Your OTP is below", // plaintext body
                            html: forgotpasswordtemplate
                        };
                        transporter.sendMail(mailOptions, function (err, data) {
                            if (err) {
                                res.status(400).json({ status: 400, err_field: err, result: null });
                            }
                            else {

                                res.status(200).json({ status: 200, err_field: null, message: "OTP has been sent to the your registered Email", result: data });
                            }
                        });
                    } else {
                        res.status(200).json({ "status": 400, "err_filed": "OTP is not updated", "result": null });
                    }

                })
            } else {
                res.status(200).json({ "status": 400, "err_filed": "Please enter valid Email address", "result": null });
            }
        })
    } else {
        res.status(200).json({ "status": 400, "err_filed": "Email is required", "result": null });
    }

}


userController.prototype.otpverification = function (req, res) {
    if (req.body.email) {
        um.findemail(req.body.email, function (err, data) {
            if (data && data.length) {
                console.log("req.body.otp == data[0].otp", req.body.otp, data[0].otp)
                if (req.body.otp == data[0].otp) {
                    res.status(200).json({ "status": 200, "err_filed": null, "message": "success" });
                } else {
                    res.status(200).json({ "status": 400, "err_filed": "OTP not matched", "result": null });
                }

            } else {
                res.status(200).json({ "status": 400, "err_filed": "Please provide valid email", "result": null });
            }
        })
    } else {
        res.status(200).json({ "status": 400, "err_filed": "Email is required", "result": null });
    }

}

userController.prototype.ChangePassword = function (req, res) {
    if (req.body.email == undefined || req.body.email == '' || req.body.email == null) {
        res.status(200).json({ "status": 400, "err_filed": "Email  is require", "result": null })
    }

    if (req.body.newpassword == undefined || req.body.newpassword == '' || req.body.newpassword == null) {
        res.status(200).json({ "status": 400, "err_filed": "newpassword  is require", "result": null })
    } else {
        um.findemail(req.body.email, (err, data) => {
            if (err) {
                res.status(200).json({ "status": 400, err_field: "something  went to wrong", result: null })
            }
            else {
                if (data == null || data.length <= 0) {
                    res.status(200).json({ "status": 400, err_fild: "Email  id not found", result: null })
                } else {
                    if (req.body.type == '0') {
                        um.updatepassword(req.body, (err, respon) => {
                            if (err) {
                                res.status(200).json({ "status": 400, "err_filed": "something went to wrong", "result": null })
                            } else {
                                res.status(200).json({ "status": 200, "err_filed": null, "message": "your password updated successfully" })
                            }
                        })

                    } else {
                        um.comparePassword(req.body.password, data[0].password, (err, response) => {
                            if (response && response == true) {
                                um.updatepassword(req.body, (err, respon) => {
                                    if (err) {
                                        res.status(200).json({ "status": 400, "err_filed": "something went to wrong", "result": null })
                                    } else {
                                        res.status(200).json({ "status": 200, "err_filed": null, "message": "your password updated successfully", "result": null })
                                    }
                                })
                            } else {
                                res.status(200).json({ "status": 400, "err_filed": "Your old password is not valid", "result": null })
                            }
                        })
                    }

                }
            }
        })
    }

}


module.exports = userController;