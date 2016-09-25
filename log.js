/**
 * Created by damon.zhang on 2016/9/21.
 */
var log4js = require('log4js');

log4js.configure({
    appenders: [
        {
            type: 'console',
            category: "console"

        }, //控制台输出
        {
            type: "file",
            filename: 'logs/logInfo',
            pattern: "yyyy-MM-dd.log",
            maxLogSize: 20480,
            backups: 30,
            category: 'dateFileLog'

        }//日期文件格式
    ],
    replaceConsole: true,   //替换console.logs
    levels:{
        dateFileLog: 'info',
        console: 'debug'
    }
});


var dateFileLog = log4js.getLogger('dateFileLog');
var consoleLog = log4js.getLogger('console');
exports.logger = dateFileLog;


exports.use = function(app) {
    app.use(log4js.connectLogger(dateFileLog, {level:'INFO', format:':method :url'}));
}