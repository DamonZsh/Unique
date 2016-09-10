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

router.post('/upload',  function (req, res) {
    console.info( req.file);
    var new_file_name =  req.file.originalname.substring(req.file.originalname.lastIndexOf("."));

    var date = new Date();
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
                console.info(data);
                app.render('../template/receiver.ejs',{name : "damon" , poster: "damon" }, function(err, html){
                    if(err){
                        console.info(err);
                    }else{
                        console.info(html);

                    }
                });
                res.end(new_file_name);
            }
        });
    });
});

router.post("/save_upload", function (req, res) {
    var ofn = req.body["original_file_name"];
    var nfn = req.body["new_file_name"];
    var poster = req.body["poster"];
    var mails = req.body["mails"];
    var save_time = req.body["save_time"];
    var current = new Date();
    var expired_date = current.getDate() + save_time;
    dbpool("insert into sharing values(0,?,?,?,?,?,?,?)", [poster, nfn, ofn, mails, current, expired_date, "1"], function (err) {
        if (err) {
            console.log(err);
            res.end("ERROR");
        }
    });
    res.end("shared file has mailed to audiences.");
});

router.get("/download/:id",function (req,res) {
    var id = req.params.id;
    conn = mysql.createConnection(options);
    conn.connect(function (err) {
        if (err) {
            console.error("connect db " + options.host + " error: " + err);
            process.exit();
        }
    });
    conn.query("select * from sharing where file_original_name = ?", [id], function selectRes(err, rows) {
        if (err) {
            console.log(err);
            res.end("ERROR");
        }
        res.render("download.html",{poster:rows[0].poster,expiredDay:rows[0].expiredDay,fileName:rows[0].original_file_name});
    });
    conn.end();
});

router.get("/downloading/:fileName",function (req,res) {
    var fileName = req.params.fileName;
    console.log("file name is" + fileName);
    var filePath = __dirname.replace("routes", "") + "public/files/" + fileName;
    console.log("file path is:" + filePath);
    res.download(filePath);
});

router.get("/testing",function(req,res){
    res.render("testing",{poster:"Kevin",expiredDay:"2016-09-30",fileName:"test.txt",size:"30M"});
});

module.exports = router;