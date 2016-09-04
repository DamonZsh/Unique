/*
 * GET share page.
 */



/*share*/
var express = require('express');
var multer = require('multer');
var fs = require("fs");
var uuid = require("node-uuid");

var router = express.Router();

var u = multer({dist: "temp/"});

router.get('/list_share', function (req, res) {
    res.render('share', {title: 'share'});
});

router.post("/upload", u.single('avatar'), function (req, res) {

    console.log(req);

    var user_id = '1';
    var old_file_name = req.file.originalname;
    var new_file_name = uuid.v1() + req.file.originalname.substring(req.file.originalname.lastIndexOf("."));

    var des_file = __dirname.replace("routes", "") + "public/files/" + new_file_name;
    fs.readFile(req.file.buffer, function (err, data) {
        fs.writeFile(des_file, data, function (err) {
            if (err) {
                console.log(err);
            } else {

                // insert to database
                response = {status: 'ok'};
            }
            console.log(response);
            res.end(JSON.stringify(response));
        });
    });
});

module.exports = router;