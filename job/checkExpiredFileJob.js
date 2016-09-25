/**
 * Created by damon.zhang on 2016/9/22.
 */
var schedule = require('node-schedule');
var dbpool = require('../Models/DBPool.js');
var rule = new schedule.RecurrenceRule();
var logger = require('../log.js').logger;



rule.dayOfWeek = [0, new schedule.Range(1, 6)];
rule.hour = 0;
rule.minute = 0;

var j = schedule.scheduleJob(rule, function(){
    //the below job is to delete the expired file
    logger.log('schedule to update expired sharing:' + new Date());
    dbpool("UPDATE SHARING SET STATUS = 1 WHERE EXPIRE_DATE < CURRENT_TIME() AND STATUS = 0", function (err, result) {
        if (err) {
            logger.error(err);
        }
    });

});

module.exports = j ;
