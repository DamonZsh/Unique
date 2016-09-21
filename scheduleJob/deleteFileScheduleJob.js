/**
 * Created by damon.zhang on 2016/9/15.
 */
/**
 * Created by damon.zhang on 2016/9/5.
 * To run the job to send email
 */

var schedule = require('node-schedule');
var fs = require("fs");
var dbpool = require('../Models/DBPool.js');
var emailSender = require('../Models/EmailSender.js');
var option =[];
var rule = new schedule.RecurrenceRule();
var mailServerAddress = "filecourier@163.com";
var logger = require('../log.js').logger;

var times = [];
for(var i =1 ;i<60;i++) times.push(i = i+ 4);

rule.minute = times;

var j = schedule.scheduleJob(rule, function(){
    logger.info('');
   });


module.exports = j ;
