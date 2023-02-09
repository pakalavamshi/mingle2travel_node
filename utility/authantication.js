var jwt = require('jsonwebtoken');
var config=require('../config/config')
console.log(config.secret)
module.exports = function (req, res, next) {
    //console.log(req.body)
    var token = req.headers.token||req.body.token||req.query.token;
    console.log(token);
    jwt.verify(token, config.secret, (err, responce) => {
        if (err) {    
        console.log("teja...",err)
            res.status(400).json({ "status":400,err_field: "Not a valid token"});
        } else {
            next()
        }
    })
     
}