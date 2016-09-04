/*
 * GET share page.
 */



/*share*/

var express = require('express');
var fs = require('fs');
var util = require('util');
var router = express.Router();

router.get('/list_share', function (req, res) {
    res.render('share', {title: 'share'});
});

router.post("/upload", function (req, res) {
    // can't get request body, shit!
    var content = '';
    req.on('data', function (data) {
        // Append data.
        content += data;
    });
    req.on('end', function () {
        // Assuming, we're receiving JSON, parse the string into a JSON object to return.
        // var data = JSON.parse(content);
        // res.render('index', { txtName: data.txtName });
    });
    console.log(content);
    res.end("ok")
});

module.exports = router;