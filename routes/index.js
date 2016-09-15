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

var router = express.Router();
var app = express();
/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {title: 'Welcome'});
});
var filename ;
var filesize ;

router.post('/uploadFiles' , upload.array('file', 50), function (req, res) {
    var u1 = uuid.v1();
    var date = new Date();
   var posterIp = null;

    var files = req.files;
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
    var des_file = subfolder + "\\" + new_file_name;
    files.forEach(function(file){
        var f = subfolder + "\\" + file.originalname;
        fs.readFile(file.path, function (err, data) {
            if(err){
                console.info('upload err :' + err)
            }else{
                fs.writeFile(f, data, function (err) {
                    if(err){
                        console.error('err =' + err);
                    }else {
                        console.info('you have uploaded the file ' + file.originalname);
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

    app.render('../template/poster0.ejs',{name : poster, files : filejson, effectiveDate : new_file_effective, emails : receiver , confirmation :"/confirmation/" + subfolder}, function(err, html){
        if(err){
            console.error(err);
        }else{
            console.info(html);
            dbpool("insert into sharing(ID, POSTER, FILE_LOCATION, FILE_NAME, EXPIRE_DATE, FILE_SIZE, POSTER_IP)  values(?,?,?,?,?,?,?)", [uuid.v1(), poster, subfolder, new_file_name,  new_file_effective, new_file_size, posterIp], function (err) {
                if (err) {
                    console.error(err);
                    res.end("ERROR");
                }else{
                    console.info('data inserted into SHARING');
                }
            });
            dbpool("insert into mail_to(ID, EMAIL_POSTER, EMAIL_RECEIVER, EMAIL_SUBJECT, EMAIL_CONTENT) values(?,?,?,?,?)", [uuid.v1(), poster, poster, subject0, html], function (err) {
                if (err) {
                    console.log(err);
                    res.end("ERROR");
                } else{
                        console.info('data inserted into MAIL_TO');
                }

            });
        }
    });
    app.render('../template/receiver.ejs',{name : poster, files : [{name : new_file_name , size : new_file_size, effectiveDate : new_file_effective}], link0: "/downloading/" + subfolder }, function(err, html){
        if(err){
            console.error(err);
        }else{
            dbpool("insert into mail_to(ID, EMAIL_POSTER, EMAIL_RECEIVER, EMAIL_SUBJECT, EMAIL_CONTENT) values(?,?,?,?,?)", [uuid.v1(), poster, receiver, subject1, html], function (err) {
                if (err) {
                    console.error(err);
                    res.end("ERROR");
                } else{
                    console.info('data inserted into MAIL_TO');
                }
            });
        }
    });
});

router.get('/confirmation/:id', function (req,res) {
   var id = req.params.id;
    dbpool("select * from sharing where file_original_name = ? and isConfirmed = '0'", [id], function selectRes(err, rows) {
        if (err) {
            console.log(err);
            res.end("ERROR");
        }
        if(rows[0].expiredDay < formatDate(new Date())){
            res.render("fileDeleted",{poster:rows[0].poster});
        }else{
            dbpool("update sharing set isConfirmed ='1' where file_original_name = ? and isConfirmed = '0'",[id], function (err, rows) {
                if(err){
                    console.log(err);
                    res.end("ERROR");
                }else{
                    res.render("confirmation",{name: rows[0].poster});
                }
            })
        }
    });
});

router.get("/download/:id",function (req,res) {
    var id = req.params.id;
    dbpool("select * from sharing where file_original_name = ?", [id], function selectRes(err, rows) {
        if (err) {
            console.log(err);
            res.end("ERROR");
        }
        if(rows[0].expiredDay < formatDate(new Date())){
            res.render("fileDeleted",{poster:row[0].poster});
        }else{
            res.render("download",{poster:rows[0].poster,expiredDay:rows[0].expiredDay,
                fileName:rows[0].original_file_name});
        }
    });
});

router.get("/downloading/:fileName",function (req,res) {
    var fileName = req.params.fileName;

    var file_location = "";
    dbpool("select * from sharing where file_original_name = ?", [fileName], function selectRes(err, rows) {
        if (err) {
            console.log(err);
            res.end("ERROR");
        }
        file_location= rows[0].file_location ;
    });
    var filePath = file_location +"\\"+ fileName;
    res.download(filePath);
});


router.get("/testing/:id",function(req,res){
    var id = req.params.id;
    console.log("file path is:" + id);
    if(id == 1){
        res.render("testing",{poster:"Kevin",expiredDay:"2016-09-30",fileName:"test.txt",size:"30M"});
    }else{
        res.render("fileDeleted",{poster:"Ke"});
    }

});
var getClientIp = function () {
    var ipAddress;
    var forwardedIpStr = this.headers('x-forwarded-for');
    if(forwardedIpStr){
        var forwardedIps = forwardedIpStr.split(',');
        ipAddress = forwardedIps[0];
    }else{
        ipAddress = req.connection.remoteAddress;
    }
    return ipAddress;
}

module.exports = router;