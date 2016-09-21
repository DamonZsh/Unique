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
    var filename ;
    var filesize ;
    var u1 = uuid.v1();
    var date = new Date();
    var posterIp = getClientIp(req);
    var files = req.files;
    var host = req.hostname;
    var port = '3000';
    var server = host+':'+port;
    files.forEach(function(file){
        if(filename==undefined){
            filename =  file.originalname + "*";
        }else{
            filename = filename + "" + file.originalname + "*";
        }
        if(filesize==undefined){
            filesize = parseInt(file.size/1024) + "Kb*";
        }else{
            filesize = filesize + "" + parseInt(file.size/1024) + "Kb*";
        }

    });
    var new_file_name = filename.substring(0, filename.length-2);
    var new_file_size = filesize.substring(0, filename.length-2);
    var confirmationId = uuid.v1();
    var poster = req.body['email0'];
    var receiver = req.body['email1'];
    var subject0 = 'You have shared some files';
    var subject1 = 'You have been shared some files';
    var new_file_effective = req.body['duration0'];
    var encriptPath = u1 + "" + poster;
    var father_folder = __dirname.replace("routes", "") + "public\\files\\";
    var yearMonth = date.getFullYear().toString() +"-" + (date.getMonth()+1).toString();
    var des_folder = __dirname.replace("routes", "") + "public\\files\\" + yearMonth + "\\";
    var subfolder = des_folder  + encriptPath;
    if(!fs.existsSync(father_folder)){
        fs.mkdirSync(father_folder);
    }
    if(!fs.existsSync(des_folder)){
        fs.mkdirSync(des_folder);
    };
    if(!fs.existsSync(subfolder)){
        fs.mkdirSync(subfolder);
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
                        logger.info('you have uploaded the file ' + file.originalname);
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

    app.render('../template/poster0.ejs',{name : poster, files : filejson, effectiveDate : new_file_effective, emails : receiver , confirmation :server + "/confirmation/" + crypto.aesEncrypt(confirmationId)}, function(err, html){
        if(err){
            logger.error(err);
        }else{
            logger.info(html);
            dbpool("insert into sharing(ID, POSTER, FILE_LOCATION, FILE_NAME, EXPIRE_DATE, FILE_SIZE, POSTER_IP, CONFIRMATION_ID)  values(?,?,?,?,?,?,?, ?)", [uuid.v1(), poster, subfolder, new_file_name,  new_file_effective, new_file_size, posterIp, confirmationId], function (err) {
                if (err) {
                    logger.error(err);
                    res.end("ERROR");
                }else{
                    logger.info('data inserted into SHARING');
                }
            });
            dbpool("insert into mail_to(ID, EMAIL_POSTER, EMAIL_RECEIVER, EMAIL_SUBJECT, EMAIL_CONTENT, SHARING_ID, ISCONFIRMED) values(?,?,?,?,?,?,?)", [uuid.v1(), poster, poster, subject0, html, confirmationId,'1'], function (err) {
                if (err) {
                    logger.log(err);
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
            app.render('../template/receiver.ejs',{name : poster, files : filejson, effectiveDate : new_file_effective, link0:server + "/download/" + encr}, function(err, html){
                if(err){
                    logger.error(err);
                }else{
                    logger.info(html);
                    dbpool("insert into mail_to(ID, EMAIL_POSTER, EMAIL_RECEIVER, EMAIL_SUBJECT, EMAIL_CONTENT, SHARING_ID) values(?,?,?,?,?,?)", [uuid.v1(), poster, email, subject1, html, confirmationId], function (err) {
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
        if(err){  logger.log('zip file error:'+stderr);}
        else{
            var data = JSON.parse(stdout);
            logger.log(data);
        }

    })

});

router.post('/confirmation', function (req,res) {
   var encrypt = req.body['id'];
    var id = crypto.aesDecrypt(encrypt);
    dbpool("select * from sharing where CONFIRMATION_ID = ? and isConfirmed = '0'", [id], function (err, rows) {
        if (err) {
            logger.log(err);
            res.end("ERROR");
        }
        if(rows.length==0){
            res.render("confirmation",{status: '1'});
        }else if(rows['expire_Day'] < formatDate(new Date())){
            res.render("fileDeleted",{poster:rows['poster']});
        }else{
            dbpool("update sharing set isConfirmed ='1' where CONFIRMATION_ID = ? and isConfirmed = '0'",[id], function (err, rows) {
                if(err){
                    logger.log(err);
                    res.end("ERROR");
                }else{
                    res.render("confirmation",{name: rows['poster'], status: '0'});
                }
            });
            dbpool("update mail_to set isConfirmed ='1' where SHARING_ID = ? and ISCONFIRMED = '0'",[id], function (err, rows) {
                if(err){
                    logger.log(err);
                    res.end("ERROR");
                }
            })
        }
    });
    res.end();
});

router.get("/download/:id",function (req,res) {
    var encrypt = req.params.id;
    var id = crypto.aesDecrypt(encrypt);
    var id2 = id.substring(0, 36);

    dbpool("select * from sharing where CONFIRMATION_ID = ? and isConfirmed = '1'", [id2], function(err, rows) {
        if (err) {
            logger.log(err);
            res.end("ERROR");
        }
        if(rows[0]['expire_Day'] < formatDate(new Date())){
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
            var effectiveDate = rows[0]['EXPIRE_DATE'];
            var poster = rows[0]['POSTER'];
            logger.info(poster);
            res.render("download",{poster:poster,expiredDay:effectiveDate,files:filejson, link : '/downloading/' + encrypt + '.zip'});
        }
    });
});

router.get("/downloading/:fileName",function (req,res) {
    var fileName = req.params.fileName;
    var confirmationId = fileName.substring(0, fileName.indexOf('.'));
    var file_location = "";
    var ip = getClientIp(req);
    var url = req.url;
    var theRequest = null;
    var email = null;
    if (url.indexOf("/upload/") != -1) {
        theRequest = url.substring(url.indexOf("/download/") + 10, url.length );
        email = crypto.aesDecrypt(theRequest).substring(36, id.length);
    }
    dbpool("select * from sharing where confirmation_id = ?", [confirmationId], function selectRes(err, rows) {
        if (err) {
            logger.error(err);
            res.end("ERROR");
        }else {
            if(rows.length>0){
                file_location= rows[0]['FILE_LOCATION'];
                res.download(file_location);
                dbpool("INSERT INTO FILE_DOWNLOAD(ID, DOWNLOADER, fileId, update_time, download_times, downloadIp)VALUES(?,?,?,?,?,?)",[uuid.v1(), email, rows[0]['ID'], new Date(), '1', ip], function (err, rows) {
                    if(err){
                        logger.error(err);
                    }
                })
            }

        }

    });
    //var filePath = file_location +"\\"+ fileName;

});


router.get("/testing/:id",function(req,res){
    var id = req.params.id;
    logger.log("file path is:" + id);
    if(id == 1){
        res.render("testing",{poster:"Kevin",expiredDay:"2016-09-30",fileName:"test.txt",size:"30M"});
    }else{
        res.render("fileDeleted",{poster:"Ke"});
    }

});
var getClientIp = function (req) {
    return (req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress);
}

module.exports = router;