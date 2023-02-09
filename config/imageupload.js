var express = require('express'),
    aws = require('aws-sdk'),
    bodyParser = require('body-parser'),
    multer = require('multer'), 
    multerS3 = require('multer-s3'); 

aws.config.update({
    secretAccessKey: '8cfcqyJdXQX7JXt69PP6kB75yU1pTRB4LUsNYrDV',
    accessKeyId: 'AKIAJOZJMISVE2GLVAXQ',
    region: 'us-east-2'
});

var app = express(),
    s3 = new aws.S3();

app.use(bodyParser.json());



exports.upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'seeimages',
        acl: 'public-read',
      
        key: function (req, file, cb) {
           
            cb(null, Date.now().toString()); 
        }
    })
});
