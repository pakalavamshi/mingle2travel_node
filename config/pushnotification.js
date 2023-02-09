var admin = require('firebase-admin')
var serviceaccount = require('./seewheelers-firebase-adminsdk-qercz-e0876a6a2f.json');
var userModelSchema = require('../schema/userSchema')
admin.initializeApp({
    credential: admin.credential.cert(serviceaccount),
    databaseURL: 'https://seewheelers.firebaseio.com/'
});



exports.sendnotification = function (userId, title, body, obj,page,page_sub) {
    console.log("page,page_sub",page,page_sub)
    var key = page
    var key1 = page_sub
    userModelSchema.find({ _id: userId }, function (usererr, userdata) {
        if (userdata && userdata.length && userdata[0].firebase_token && userdata[0].firebase_token != "") {
            var registrationToken = userdata[0].firebase_token;
            var payload = {
                notification: {
                    title: title,
                    body: body,
                    page : key,
                    page_sub : key1
                  
                    
                },
                data: {
                    title: title,
                    body: body,
                    page : key,
                    page_sub : key1
                    
                }

            };
            var options = {
                priority: "high",

            };
            admin.messaging().sendToDevice(registrationToken, payload, options)
                .then((response) => {
                    obj.created_on = new Date().getTime();
                    obj.updated_on = new Date().toLocaleString('en-US', { timeZone: 'Asia/Calcutta' });
                    obj.page = key;
                    obj.page_sub = key1;
                    var notificationdata = new notificationSchema(obj)
                    notificationdata.save(notificationdata, function (saveerr, saveddata) {
                        console.log("saveerr,saveddata", saveerr, saveddata)
                    })
                    // Response is a message ID string.
                    console.log('Successfully sent message:', response);
                    // res.send(response)
                })
                .catch((error) => {
                    console.log('Error sending message:', error);
                });
        }
    })

}



exports.sendmultiplenotification = function (usersdata, title, body, obj,action,action_sub) {
    if (usersdata && usersdata.length) {
        usersdata.forEach(function (userId, index) {
            userModelSchema.find({ _id: userId }, function (usererr, userdata) {
                if (userdata && userdata.length && userdata[0].firebase_token && userdata[0].firebase_token != "") {
                    var registrationToken = userdata[0].firebase_token;
                    var payload = {
                        notification: {
                            title: title,
                            body: body
                        },
                        data: {
                            title: title,
                            body: body,
                            action : action,
                            action_sub : action_sub
                        }

                    };
                    var options = {
                        priority: "high",

                    };
                    admin.messaging().sendToDevice(registrationToken, payload, options)
                        .then((response) => {
                            obj.userId = userId;
                            obj.created_on = new Date().getTime();
                            obj.updated_on = new Date().toLocaleString('en-US', { timeZone: 'Asia/Calcutta' });
                            obj.action = action;
                            obj.action_sub = action_sub;
                            var notificationdata = new notificationSchema(obj)
                            notificationdata.save(notificationdata, function (saveerr, saveddata) {
                                console.log("saveerr,saveddata", saveerr, saveddata)
                            })
                            // Response is a message ID string.
                            console.log('Successfully sent message:', response);
                            // res.send(response)
                        })
                        .catch((error) => {
                            console.log('Error sending message:', error);
                        });
                }
            })
        })

    }

}



