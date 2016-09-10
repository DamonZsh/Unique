/**
 * Created by damon.zhang on 2016/9/5.
 */

var enodemailer  = require('nodemailer');
var mailServerAddress = "filecourier@163.com";
var password = "123456zsh";

var smtpConfig = {
    host: 'smtp.163.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: mailServerAddress,
        pass: password
    }
};

var transporter = enodemailer.createTransport(smtpConfig);

var emailSender = function (options, callback) {
    transporter.sendMail(options, function(err, info){
        if(err){
           callback(err.toString());
        }else
            console.log('Message sent: ' + info.response);
    })
}


module.exports=emailSender;