/*
 * GET home page.
 */


var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require("fs");
var uuid = require("node-uuid");

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

    console.log(ofn);
    console.log(nfn);
    console.log(poster);
    console.log(mails);
    console.log(save_time);
    res.end("shared file has mailed to audiences.");
});

module.exports = router;