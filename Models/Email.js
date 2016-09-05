/**
 * Created by damon.zhang on 2016/9/5.
 */

var enodemailer  = require('nodemailer');
var mailServerAddress = "XXXX@XXX.com";
var password = "XXXXXXXX";
var transporter = enodemailer.createTransport('host: "smtp.qq.com", auth: {  user: ' + mailServerAddress +  ', pass: '+ password +'}  ');

var emailSender = function (options, callback) {
    transporter.send(options, function(err, info){
        if(err){
            return console.error(error);
        }
        console.log('Message sent: ' + info.response);
    })
}


module.exports=emailSender;