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
var logger = require('../log.js').logger;

var times = [];
for(var i =1 ;i < 60;i++) times.push(i = i+ 4);

rule.minute = times;

var j = schedule.scheduleJob(rule, function(){
    //every min to get the 100 unsent email to send. if send success, then set the stauts=1, if fail, sendcount++,
    dbpool("SELECT ID, EMAIL_POSTER, EMAIL_RECEIVER, EMAIL_SUBJECT, EMAIL_CONTENT FROM MAIL_TO WHERE EMAIL_SENDCOUNT<10 AND EMAIL_STATUS='0' AND ISCONFIRMED='1' ORDER BY EMAIL_SENDCOUNT LIMIT 30;",
        function(err, vals){
            if(err){
                logger.error(err);
                return;
            }
            if(vals.length > 0){
                for(var i = 0; i<vals.length ; i++){
                    var ID = vals[i]['ID'];
                    logger.info("start to send the email to " + vals[i]['EMAIL_RECEIVER']);
                    option = {
                        from : mailServerAddress,
                        to: vals[i]['EMAIL_RECEIVER'],
                        subject : vals[i]['EMAIL_SUBJECT'],
                        html : vals[i]['EMAIL_CONTENT']
                    };

                    emailSender(option, function(emailSenderError){
                        if(emailSenderError){
                            // logger.info(vals[i]['ID']);
                            logger.error('send email error : ' + emailSenderError);
                            dbpool("UPDATE MAIL_TO SET EMAIL_SENDCOUNT=EMAIL_SENDCOUNT+1  WHERE ID='" + ID + "';", function(updateCountError,updatedValues){
                                if(updateCountError){
                                    logger.error('update sendcount error : ' + updateCountError);
                                }else{
                                    logger.log('update sendcount success : ' + updatedValues.affectedRows);
                                }
                            });
                        }else{
                            dbpool("UPDATE MAIL_TO SET EMAIL_STATUS='0'  WHERE ID='" + ID +"';",function(updateStatusError,updatedValues){
                                if(err){
                                    logger.error('update status error : ' + updateStatusError);
                                }else {
                                    logger.log('email send success, update status success : ' + updatedValues.affectedRows);
                                }
                            });
                        }
                    });
                }
            }
        });

    //the below job is to delete the expired file

    // logger.log('schedule to update expired sharing:' + new Date());
    //
    // dbpool("update sharing set status = 0 where expire_date < current_time() and status = 1", function (err, result) {
    //     if (err) {
    //         logger.error(err);
    //     }
    // });

});

module.exports = j ;
