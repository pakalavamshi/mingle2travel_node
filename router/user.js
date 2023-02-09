var express=require('express')
var router= express()
var multer  = require('multer')
var  usercontroller=require('../controllers/userController')
uc=new  usercontroller()
var tokenverification=require('../utility/authantication.js')



router.post('/UserCreation',uc.UserCreation)
router.post('/UserLogin',uc.UserLogin)

router.post('/userforgotpassword',uc.userforgotpassword)
router.post('/otpverification',uc.otpverification)
router.post('/ChangePassword',uc.ChangePassword)



module.exports= router