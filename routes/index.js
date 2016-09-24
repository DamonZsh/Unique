/*
 * GET home page.
 */


var express = require('express');
var multer = require('multer');
var upload = multer({dest: "temp/"});
var fs = require("fs");
var uuid = require("node-uuid");
var mysql = require('mysql');
var ejs = require("ejs");
var dbpool = require('../Models/DBPool.js');
var formatDate = require('../Models/comm.js');
var crypto = require('../Models/crypto.js');
var exec = require('child_process').exec();
var logger = require('../log.js').logger;
var router = express.Router();
var app = express();

    /* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {title: 'Welcome'});
});


router.post('/uploadFiles' , upload.array('file', 50), function (req, res) {

    var filename;
    var filesize;
    var u1 = uuid.v1();
    var confirmationId = uuid.v1();
    var date = new Date();
    var posterIp = getClientIp(req);
    var files = req.files;
    var host = req.hostname;
    var port = '3000';
    var server = 'http://' + host+':'+port;

    files.forEach(function(file){
        filename = filename===undefined ?  file.originalname + "*" : filename + "" + file.originalname + "*";
        filesize = filesize===undefined ?  parseInt(file.size/1024) + "Kb*" : filesize + "" + parseInt(file.size/1024) + "Kb*";
    });
    var new_file_name = filename.substring(0, filename.length-2);
    var new_file_size = filesize.substring(0, filename.length-2);

    var poster = req.body['email0'];
    var receiver = req.body['email1'];
    var subject0 = 'You have shared some files';
    var subject1 = 'You have been shared some files';
    var new_file_effective = req.body['duration0'];
    var encriptPath = u1 + "" + poster;
    var rootFolder = __dirname.replace("routes", "");
    var father_folder =  "public\\files\\";
    var yearMonth = date.getFullYear().toString() +"-" + (date.getMonth()+1).toString();
    var des_folder =  father_folder + yearMonth + "\\";
    var subfolder = des_folder  + encriptPath;
    if(!fs.existsSync(rootFolder + father_folder)){
        fs.mkdirSync(rootFolder + father_folder);
    }
    if(!fs.existsSync(rootFolder + des_folder)){
        fs.mkdirSync(rootFolder + des_folder);
    };
    if(!fs.existsSync(rootFolder + subfolder)){
        fs.mkdirSync(rootFolder + subfolder);
    }
    files.forEach(function(file){
        var f = subfolder + "\\" + file.originalname;
        fs.readFile(file.path, function (err, data) {
            if(err){
                logger.info('upload err :' + err)
            }else{
                fs.writeFile(f, data, function (err) {
                    if(err){
                        logger.error('err =' + err);
                    }else {
                        logger.info(posterIp + ' have uploaded the file //' + file.originalname + '//');
                        res.end();
                    }
                })
            }

        } );
    });
    var _filesname = new_file_name.split('*');

    var _filessize = new_file_size.split('*');
    var filejson =[];
    for(var i =0 ; i< _filesname.length;i++){
        var _file = {name: _filesname[i] , size : _filessize[i]};
        filejson.push(_file);
    }

    app.render('../template/poster0.ejs',{name : poster, files : filejson, expiredDay : new_file_effective, emails : receiver , confirmation :server + "/confirmation/" + crypto.aesEncrypt(confirmationId)}, function(err, html){
        if(err){
            logger.error(err);
        }else{
            logger.info(html);
            dbpool("INSERT INTO SHARING(ID, POSTER, FILE_LOCATION, FILE_NAME, EXPIRE_DATE, FILE_SIZE, POSTER_IP, CONFIRMATION_ID, RECEIVERS) VALUES(?,?,?,?,?,?,?, ?, ?)", [uuid.v1(), poster, subfolder, new_file_name,  new_file_effective, new_file_size, posterIp, confirmationId, receiver], function (err) {
                if (err) {
                    logger.error(err);
                    res.end("ERROR");
                }else{
                    logger.info('data inserted into SHARING');
                }
            });
            dbpool("INSERT INTO MAIL_TO(ID, EMAIL_POSTER, EMAIL_RECEIVER, EMAIL_SUBJECT, EMAIL_CONTENT, SHARING_ID, ISCONFIRMED) VALUES(?,?,?,?,?,?,?)", [uuid.v1(), poster, poster, subject0, html, confirmationId,'1'], function (err) {
                if (err) {
                    logger.error(err);
                    res.end("ERROR");
                } else{
                    logger.info('data inserted into MAIL_TO');
                }

            });
        }
    });

    var _receiver = receiver.split(';');
    for(var i=0; i<_receiver.length;i++){
        var email = _receiver[i];
        var encr =crypto.aesEncrypt(confirmationId+""+ email);
        if(email!=null && email!=undefined){
            app.render('../template/receiver.ejs',{name : poster, files : filejson, expiredDay : new_file_effective, link0:server + "/download/" + encr}, function(err, html){
                if(err){
                    logger.error(err);
                }else{
                    logger.info(html);
                    dbpool("INSERT INTO MAIL_TO(ID, EMAIL_POSTER, EMAIL_RECEIVER, EMAIL_SUBJECT, EMAIL_CONTENT, SHARING_ID) VALUES(?,?,?,?,?,?)", [uuid.v1(), poster, email, subject1, html, confirmationId], function (err) {
                        if (err) {
                            logger.error(err);
                            res.end("ERROR");
                        } else{
                            logger.info('data inserted into MAIL_TO');
                        }
                    });
                }
            });
        }
    };

    //zip the file
    var cmd = 'zip -r ' + subfolder +'.zip ./*'
    //var cmd = 'makecab ' + subfolder + ' ' + subfolder +'.zip';
    fs.
    exec(cmd, function (err, stdout, stderr) {
        if(err){ logger.log('zip file error:'+stderr);}
        else{
            var data = JSON.parse(stdout);
            logger.log(data);
        }

    })

});

router.get('/confirmation/:id', function (req, res) {
    var filejson =[];
    var effectiveDate = null;
    var poster = null;
    var status = 1;
    var email = null;
    dbpool("SELECT * FROM SHARING WHERE CONFIRMATION_ID = ? AND ISCONFIRMED = '0' AND STATUS='0'", [crypto.aesDecrypt(req.params.id)], function (err, row) {
        if (err) {
            logger.error(err);
            res.end("ERROR");
        }else{
            if(row.length>0){
                var _filesname =  row[0]['FILE_NAME'].split('*');
                var _filessize = row[0]['FILE_SIZE'].split('*');
                for(var i =0 ; i< _filesname.length;i++){
                    var _file = {name: _filesname[i] , size : _filessize[i]};
                    filejson.push(_file);
                }
                effectiveDate = formatDate(row[0]['EXPIRE_DATE']) + " 24:00:00 ( GMT+0800)";
                poster = row[0]['POSTER'];
                status = 0;
                email = row[0]['RECEIVERS'];
            }
            res.render("confirm1",{status : status, name:poster,expiredDay:effectiveDate,files:filejson, email : email});
        }
    });



});
router.post('/yesHereYouGo', function (req,res) {
    var id = crypto.aesDecrypt(req.body['id']);
   dbpool("SELECT * FROM SHARING WHERE CONFIRMATION_ID = ? AND ISCONFIRMED = '0'", [id], function (err, rows) {
        if (err) {
            logger.log(err);
            res.end("ERROR");
        }
        if(rows.length==0){
            res.render("confirmation",{status: '1'});
        }else if(rows[0]['expire_Day'] < formatDate(new Date())){
            res.render("fileDeleted",{poster:rows[0]['poster']});
        }else{
            dbpool("UPDATE SHARING SET ISCONFIRMED ='1' WHERE CONFIRMATION_ID = ? AND ISCONFIRMED = '0'",[id], function (err, updateRow) {
                if(err){
                    logger.log(err);
                    res.end("ERROR");
                }
            });
            dbpool("UPDATE MAIL_TO SET ISCONFIRMED ='1' WHERE SHARING_ID = ? AND ISCONFIRMED = '0'",[id], function (err, updateRow1) {
                if(err){
                    logger.log(err);
                    res.end("ERROR");
                }
            })
        }
    });
});
router.get("/download/:id",function (req,res) {
    var encrypt = req.params.id;
    var id = crypto.aesDecrypt(encrypt);
    var id2 = id.substring(0, 36);
    var name = id.substring(36, id.length).substring(0, id.substring(36, id.length).indexOf('@'));
    var host = req.hostname;
    var port = '3000';
    var server = 'http://' + host+':'+port;
    dbpool("SELECT * FROM SHARING WHERE CONFIRMATION_ID = ? AND ISCONFIRMED = '1'", [id2], function(err, rows) {
        if (err) {
            logger.log(err);
            res.end("ERROR");
        }
        if(rows[0]['EXPIRE_DATE'] < formatDate(new Date())){
            res.render("fileDeleted",{poster:rows[0]['poster']});
        }else{
            var filejson =[];
            var FILE_NAME = rows[0]['FILE_NAME'];
            var FILE_SIZE = rows[0]['FILE_SIZE'];
            var _filesname = FILE_NAME.split('*');
            var _filessize = FILE_SIZE.split('*');
            for(var i =0 ; i< _filesname.length;i++){
                var _file = {name: _filesname[i] , size : _filessize[i]};
                filejson.push(_file);
            }
            var effectiveDate = formatDate(rows[0]['EXPIRE_DATE']);
            var poster = rows[0]['POSTER'];
            res.render("download",{name:name, poster:poster,expiredDay:effectiveDate,files:filejson, link :server+ '/downloading/' + encrypt + '.zip'});
        }
    });
});

router.get("/downloading/:id",function (req,res) {
    var encrypt = req.params.id;
    var id = crypto.aesDecrypt(encrypt);
    var confirmationId = id.substring(0, 36);
    var username = id.substring(36, id.length).substring(0, id.substring(36, id.length).indexOf('@'));
    var file_location = "";
    var ip = getClientIp(req);
    dbpool("SELECT * FROM SHARING WHERE CONFIRMATION_ID = ?", [confirmationId], function selectRes(err, rows) {
        if (err) {
            logger.error(err);
            res.end("ERROR");
        }else {
            if(rows.length>0){
                file_path= rows[0]['FILE_LOCATION'];
                var rootFolder = __dirname.replace("routes", "");
                res.download(rootFolder + file_path+ '.zip', file_path+ '.zip', function(err){
                    if(err){
                        logger.error(err);
                    }
                });
                dbpool("INSERT INTO FILE_DOWNLOAD(ID, DOWNLOADER, FILEID, UPDATE_TIME, DOWNLOAD_TIMES, DOWNLOADIP)VALUES(?,?,?,?,?,?)",[uuid.v1(), username, rows[0]['ID'], new Date(), '1', ip], function (err, rows) {
                    if(err){
                        logger.error(err);
                    }
                })
            }

        }

    });

});

var getClientIp = function (req) {
    return (req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress);
}

module.exports = router;