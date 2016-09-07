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



/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {title: 'Welcome'});
});

router.post("/upload", u.single('avatar'), function (req, res) {
    var new_file_name = uuid.v1() + req.file.originalname.substring(req.file.originalname.lastIndexOf("."));
    var des_file = __dirname.replace("routes", "") + "public/files/" + new_file_name;
    fs.readFile(req.file.buffer, function (err, data) {
        fs.writeFile(des_file, data, function (err) {
            if (err) {
                console.log(err);
            } else {
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

    var expired_date;
    var current = new Date();
    if (save_time == 1) {
        expired_date = new Date(current.getTime() + 1 * 24 * 60 * 60 * 1000);
    } else if (save_time == 2) {
        expired_date = new Date(current.getTime() + 2 * 24 * 60 * 60 * 1000);
    } else if (save_time == 3) {
        expired_date = new Date(current.getTime() + 3 * 24 * 60 * 60 * 1000);
    } else {
        expired_date = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    conn = mysql.createConnection(options);
    conn.connect(function (err) {
        if (err) {
            console.error("connect db " + options.host + " error: " + err);
            process.exit();
        }
    });
    conn.query("insert into sharing values(0,?,?,?,?,?,?,?)", [poster, nfn, ofn, mails, current, expired_date, "1"], function (err) {
        if (err) {
            console.log(err);
            res.end("ERROR");
        }
    });
    conn.end();
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
        res.render("download",{poster:rows[0].poster,expiredDay:rows[0].expiredDay,fileName:rows[0].original_file_name});
    });
    conn.end();
});

router.get("/downloading/:fileName",function (req,res) {
    var fileName = req.params.fileName;
    var filePath = __dirname.replace("routes", "") + "public/files/" + fileName;
    res.download("filePath");
});

module.exports = router;