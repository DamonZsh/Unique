/*
 * GET home page.
 */


var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require("fs");
var uuid = require("node-uuid");
var mysql = require('mysql');
var u = multer({dist: "temp/"});
var ejs = require("ejs");
var dbpool = require('../Models/DBPool.js');

var app = express();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {title: 'Welcome'});
});

router.post('/uploadFiles',u.single('file'),  function (req, res) {
    var date = new Date();
    var new_file_name =  req.file.originalname;
    var new_file_size = req.file.size;
    var poster = req.body['email0'];
    var receiver = req.body['email1'];
    var subject0 = 'You have shared some files';
    var subject1 = 'You have been shared some files';
    var duration = req.body['duration0'];
    var new_file_effective =date;
    var father_folder = __dirname.replace("routes", "") + "public\\files\\";
    if(!fs.existsSync(father_folder)){
        fs.mkdirSync(father_folder).catch();
    }
    var yearMonth = date.getFullYear().toString() +"-" + date.getMonth().toString();
    var des_folder = __dirname.replace("routes", "") + "public\\files\\" + yearMonth;

    var ifFolderExist = fs.existsSync(des_folder);
    if(!ifFolderExist){
        fs.mkdirSync(des_folder).catch();
    }
    var des_file = des_folder + "\\" + new_file_name;

    fs.readFile(req.file.buffer, function (err, data) {
        fs.writeFile(des_file, data, function (err) {
            if (err) {
                console.log("err = " + err);
            } else {
                app.render('../template/poster0.ejs',{name : poster, files : [{name : new_file_name , size : new_file_size, effectiveDate : new_file_effective}], emails : receiver }, function(err, html){
                    if(err){
                        console.error(err);
                    }else{
                        dbpool("insert into sharing(POSTER, FILE_LOCATION, FILE_NAME, FILE_DURATION, EXPIRE_DATE, FILE_SIZE)  values(?,?,?,?,?,?)", [poster, des_folder, new_file_name,  duration, new_file_effective, new_file_size], function (err) {
                            if (err) {
                                console.error(err);
                                res.end("ERROR");
                            }
                        });
                        dbpool("insert into mail_to(ID, EMAIL_POSTER, EMAIL_RECEIVER, EMAIL_SUBJECT, EMAIL_CONTENT) values(?,?,?,?,?)", [uuid.v1(), poster, receiver, subject0, html], function (err) {
                            if (err) {
                                console.log(err);
                                res.end("ERROR");
                            }
                        });
                        dbpool("insert into mail_to(ID, EMAIL_POSTER, EMAIL_RECEIVER, EMAIL_SUBJECT, EMAIL_CONTENT) values(?,?,?,?,?)", [uuid.v1(), poster, poster, subject1, html], function (err) {
                            if (err) {
                                console.log(err);
                                res.end("ERROR");
                            }
                        });
                        res.end("shared file has mailed to audiences.");
                    }
                });
                app.render('../template/receiver.ejs',{name : poster, files : [{name : new_file_name , size : new_file_size, effectiveDate : new_file_effective}], link0: "/downloading/" + new_file_name }, function(err, html){
                    if(err){
                        console.error(err);
                    }else{
                        dbpool("insert into mail_to(ID, EMAIL_POSTER, EMAIL_RECEIVER, EMAIL_SUBJECT, EMAIL_CONTENT) values(?,?,?,?,?)", [uuid.v1(), poster, receiver, subject1, html], function (err) {
                            if (err) {
                                console.error(err);
                                res.end("ERROR");
                            }
                        });
                        res.end("shared file has mailed to audiences.");
                    }
                });
                res.end(new_file_name);
            }
        });
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
    // dbpool("insert into file_download(ID, down_loader, file, update_time, download_times) values(?,?,?,?,?)", [uuid.v1(), "ip", fileName, new Date(), 1], function (err) {
    //     if (err) {
    //         console.error(err);
    //         res.end("ERROR");
    //     }
    // });
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

module.exports = router;