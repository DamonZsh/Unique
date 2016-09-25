/**
 * Created by damon.zhang on 2016/9/5.
 * To run the job to send email
 */

var schedule = require('node-schedule');
var mongo = require('../Models/mongo.js');
var emailSender = require('../Models/EmailSender.js');
var option = [];
var rule = new schedule.RecurrenceRule();
var mailServerAddress = "filecourier@163.com";
var logger = require('../log.js').logger;

var times = [];
for (var i = 1; i < 60; i++) times.push(i = i + 4);

rule.minute = times;

function process_unsent_mails() {
    mongo.query_unsent_files(function (err, rows) {
        if (err) {
            console.log(err);
            return;
        }

        rows.forEach(function (row) {

            var ID = row['ID'];
            logger.info("start to send the email to " + row['EMAIL_RECEIVER']);
            option = {
                from: mailServerAddress,
                to: row['EMAIL_RECEIVER'],
                subject: row['EMAIL_SUBJECT'],
                html: row['EMAIL_CONTENT']
            };

            emailSender(option, function (emailSenderError) {
                if (emailSenderError) {
                    logger.error('send email error : ' + emailSenderError);
                } else {
                    mongo.update_mail_to_sent(ID, function (err, res) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        console.log(res);
                    });
                }
            });
        });
    });

}

var j = schedule.scheduleJob(rule, function () {
    // //every min to get the 100 unsent email to send. if send success, then set the stauts=1, if fail, sendcount++,
    process_unsent_mails();
});

// process_unsent_mails();

module.exports = j;
