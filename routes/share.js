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
    console.log(req.body);
    console.log(req.file);
    res.end("ok")
});

module.exports = router;