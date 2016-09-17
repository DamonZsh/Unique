/**
 * Created by damon.zhang on 2016/9/5.
 * To run the job to send email
 */

var schedule = require('node-schedule');
var dbpool = require('../Models/DBPool.js');
var emailSender = require('../Models/EmailSender.js');
var option =[];
var rule = new schedule.RecurrenceRule();
var mailServerAddress = "filecourier@163.com";

var times = [];
for(var i =1 ;i<60;i++) times.push(i = i+ 4);

rule.minute = times;

var j = schedule.scheduleJob(rule, function(){
    //every min to get the 100 unsent email to send. if send success, then set the stauts=1, if fail, sendcount++,
    dbpool("select ID, EMAIL_POSTER, EMAIL_RECEIVER, EMAIL_SUBJECT, EMAIL_CONTENT from mail_to where EMAIL_SENDCOUNT<10 and EMAIL_STATUS='0' and ISCONFIRMED='1' and EMAIL_RECEIVER='damon_zsh@163.com' order by EMAIL_SENDCOUNT limit 100;",
                function(err, vals){
        if(err){
            console.error(err);
            return;
        }
        if(vals.length > 0){
            for(var i = 0; i<vals.length ; i++){
                var ID = vals[i]['ID'];
                console.info("start to send the email to " + vals[i]['EMAIL_RECEIVER']);
                option = {
                    from : mailServerAddress,
                    to: vals[i]['EMAIL_RECEIVER'],
                    subject : vals[i]['EMAIL_SUBJECT'],
                    html : vals[i]['EMAIL_CONTENT']
                };

                emailSender(option, function(emailSenderError){
                    if(emailSenderError){
                       // console.info(vals[i]['ID']);
                       console.error('send email error : ' + emailSenderError);
                        dbpool("update mail_to set EMAIL_SENDCOUNT=EMAIL_SENDCOUNT+1  where id='" + ID + "';", function(updateCountError,updatedValues){
                            if(updateCountError){
                                console.error('update sendcount error : ' + updateCountError);
                            }else{
                                console.log('update sendcount success : ' + updatedValues.affectedRows);
                            }
                        });
                    }else{
                        dbpool("update mail_to set EMAIL_STATUS='0'  where id='" + ID +"';",function(updateStatusError,updatedValues){
                                if(err){
                                    console.error('update status error : ' + updateStatusError);
                                }else {
                                    console.log('email send success, update status success : ' + updatedValues.affectedRows);
                                }
                            });
                    }
                });
            }
        }
    });

    //the below job is to delete the expired file

    console.log('schedule to update expired sharing:' + new Date());

    dbpool("update sharing set status = 0 where expire_date < current_time() and status = 1", function (err, result) {
        if (err) {
            console.error(err);
        }
        console.log("updated rows is "+ result.affectedRows);
    });

});

module.exports = j ;
