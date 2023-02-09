var express = require('express')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var db = require('./config/config')
var cors = require('cors');
var app = express()
var router = require('./router/index')
app.use(bodyParser.json({ limit: '10000mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10000mb' }));
mongoose.connect(db.dburl, (err, response) => {
   if (err) {
      console.log("mongodb connection err")
   } else {
      console.log("mongodb connection sucessfully")
   }

})
var http = require('http').createServer(app);
var io = require('socket.io')(http);
io.on('connection', function (socket) {
   console.log('a user connected');
});
app.use(function (req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});
app.use(cors());
app.use('', router)

app.get('/', function (req, res) {
   return res.send({
       message: "Welcome To SEE-WHEELERS API!"
   });
});

app.listen(db.port, (err, response) => {
   if (err) {
      console.log(err)
      console.log(` err connecting  the port`)
   } else {
      console.log(`app listening the port ${db.port}`)
   }

})