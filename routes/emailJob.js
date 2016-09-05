/**
 * Created by damon.zhang on 2016/9/5.
 * To run the job to send email
 */

var schedule = require('node-schedule');
var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;
var dbpool = require('../Models/DBPool.js');
var emailSender = require('../Models/Email.js');
var option =[];
var rule = new schedule.RecurrenceRule();


function scheduleCronstyle(){
    schedule.scheduleJob('1-59 * * * * *', function(){
        dbpool("select id, status, emailTo, emailSubject, emailBody from mail_to where status='false';",function(err,vals,fields){
            if(err){
                console.info(err);
                return;
            }
            if(vals!=null){
                emailSender(option);
            }else{
                console.info("Test is Ok");
            }
        });
    });
}
scheduleCronstyle();
