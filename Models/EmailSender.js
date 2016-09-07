/**
 * Created by damon.zhang on 2016/9/5.
 */

var enodemailer  = require('nodemailer');
var mailServerAddress = "XXXXX";
var password = "XXXX";
var transporter = enodemailer.createTransport('host: "smtp.qq.com", auth: {  user: ' + mailServerAddress +  ', pass: '+ password +'}  ');

var emailSender = function (options, callback) {
    transporter.sendMail(options, function(err, info){
        if(err){
           callback(err.toString());
        }else
            console.log('Message sent: ' + info.response);
    })
}


module.exports=emailSender;