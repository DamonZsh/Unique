/**
 * Created by damon.zhang on 2016/9/15.
 */


var schedule = require('node-schedule');
var fs = require("fs");
var logger = require('../log.js').logger;
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 6)];
rule.hour = 0;
rule.minute = 0;

var j = schedule.scheduleJob(rule, function(){
    logger.info('');
   });


module.exports = j ;
