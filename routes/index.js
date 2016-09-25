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
var mongo = require('../Models/mongo.js');
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


router.post('/uploadFiles', upload.array('file', 50), function (req, res) {
    var filename;
    var filesize;
    var u1 = uuid.v1();
    var date = new Date();
    var posterIp = getClientIp(req);
    var files = req.files;
    var host = req.hostname;
    var port = '3000';
    var server = host + ':' + port;
    files.forEach(function (file) {
        if (filename == undefined) {
            filename = file.originalname + "*";
        } else {
            filename = filename + "" + file.originalname + "*";
        }
        if (filesize == undefined) {
            filesize = parseInt(file.size / 1024) + "Kb*";
        } else {
            filesize = filesize + "" + parseInt(file.size / 1024) + "Kb*";
        }

    });
    var new_file_name = filename.substring(0, filename.length - 2);
    var new_file_size = filesize.substring(0, filename.length - 2);
    var confirmationId = uuid.v1();
    var poster = req.body['email0'];
    var receiver = req.body['email1'];
    var subject0 = 'You have shared some files';
    var subject1 = 'You have been shared some files';
    var new_file_effective = req.body['duration0'];
    var encriptPath = u1 + "" + poster;
    var father_folder = __dirname.replace("routes", "") + "public\\files\\";
    var yearMonth = date.getFullYear().toString() + "-" + (date.getMonth() + 1).toString();
    var des_folder = __dirname.replace("routes", "") + "public\\files\\" + yearMonth + "\\";
    var subfolder = des_folder + encriptPath;
    if (!fs.existsSync(father_folder)) {
        fs.mkdirSync(father_folder);
    }
    if (!fs.existsSync(des_folder)) {
        fs.mkdirSync(des_folder);
    }
    ;
    if (!fs.existsSync(subfolder)) {
        fs.mkdirSync(subfolder);
    }

    files.forEach(function (file) {
        var f = subfolder + "\\" + file.originalname;
        fs.readFile(file.path, function (err, data) {
            if (err) {
                logger.info('upload err :' + err)
            } else {
                fs.writeFile(f, data, function (err) {
                    if (err) {
                        logger.error('err =' + err);
                    } else {
                        logger.info('you have uploaded the file ' + file.originalname);
                        res.end();
                    }
                })
            }

        });
    });
    var _filesname = new_file_name.split('*');
    var _filessize = new_file_size.split('*');
    var filejson = [];

    for (var i = 0; i < _filesname.length; i++) {
        var _file = {name: _filesname[i], size: _filessize[i]};
        filejson.push(_file);
    }

    app.render('C:\\Users\\Nicq Chen\\WebstormProjects\\Unique\\template\\poster0.ejs', {
        name: poster,
        files: filejson,
        effectiveDate: new_file_effective,
        emails: receiver,
        confirmation: server + "/confirmation/" + crypto.aesEncrypt(confirmationId)
    }, function (err, html) {
        if (err) {
            logger.error(err);
        } else {
            logger.info(html);

            var sharing = [{
                "ID": uuid.v1(),
                "POSTER": poster,
                "FILE_LOCATION": subfolder,
                "FILE_NAME": new_file_name,
                "EXPIRE_DATE": new_file_effective,
                "FILE_SIZE": new_file_size,
                "POSTER_IP": posterIp,
                "CONFIRMATION_ID": confirmationId,
                "STATUS": 0
            }];
            mongo.insert_sharing(sharing, function (err, res) {
                if (err) {
                    logger.error(err);
                    res.end("ERROR");
                } else {
                    logger.info('data inserted into SHARING');
                }
            });

            var mail_t0 = [{
                "ID": uuid.v1(),
                "EMAIL_POSTER": poster,
                "EMAIL_RECEIVER": poster,
                "EMAIL_SUBJECT": subject0,
                "EMAIL_CONTENT": html,
                "SHARING_ID": confirmationId,
                "ISCONFIRMED": '1',
                "EMAIL_STATUS": 0,
                "EMAIL_SENDCOUNT": 1
            }];

            mongo.insert_mail_to(mail_t0, function (err, res) {
                if (err) {
                    logger.error(err);
                    res.end("ERROR");
                } else {
                    logger.info('data inserted into MAIL_TO');
                }
            });
        }
    });

    var _receiver = receiver.split(';');
    for (var i = 0; i < _receiver.length; i++) {
        var email = _receiver[i];
        var encr = crypto.aesEncrypt(confirmationId + "" + email);
        if (email != null && email != undefined) {
            app.render('C:\\Users\\Nicq Chen\\WebstormProjects\\Unique\\template\\receiver.ejs', {
                name: poster,
                files: filejson,
                effectiveDate: new_file_effective,
                link0: server + "/download/" + encr
            }, function (err, html) {
                if (err) {
                    logger.error(err);
                } else {
                    logger.info(html);
                    var mail_t0 = [{
                        "ID": uuid.v1(),
                        "EMAIL_POSTER": poster,
                        "EMAIL_RECEIVER": email,
                        "EMAIL_SUBJECT": subject1,
                        "EMAIL_CONTENT": html,
                        "SHARING_ID": confirmationId,
                        "ISCONFIRMED": '1',
                        "EMAIL_STATUS": 0,
                        "EMAIL_SENDCOUNT": 1
                    }];

                    mongo.insert_mail_to(mail_t0, function (err, res) {
                        if (err) {
                            logger.error(err);
                            res.end("ERROR");
                        } else {
                            logger.info('data inserted into MAIL_TO');
                        }
                    });
                }
            });
        }
    }


    // //zip the file
    // var cmd = 'zip -r ' + subfolder + '.zip ./*';
    // //var cmd = 'makecab ' + subfolder + ' ' + subfolder +'.zip';
    // fs.exec(cmd, function (err, stdout, stderr) {
    //     if (err) {
    //         logger.log('zip file error:' + stderr);
    //     }
    //     else {
    //         var data = JSON.parse(stdout);
    //         logger.log(data);
    //     }
    //
    // });

});
router.get('/confirmation/:id', function (req, res) {
    var id = crypto.aesDecrypt(req.params.id);
    var where = {"CONFIRMATION_ID": id, "ISCONFIRMED": '0', "STATUS": '0'};
    mongo.query_sharing_with_confirmation_id(where, function (err, row) {
        if (err) {
            logger.error(err);
            res.end("ERROR");
        } else {
            if (row.length > 0) {
                var filejson = [];
                var _filesname = row[0]['FILE_NAME'].split('*');
                var _filessize = row[0]['FILE_SIZE'].split('*');
                for (var i = 0; i < _filesname.length; i++) {
                    var _file = {name: _filesname[i], size: _filessize[i]};
                    filejson.push(_file);
                }
                var effectiveDate = row[0]['EXPIRE_DATE'];
                var poster = row[0]['POSTER'];
                res.render("confirmation", {
                    status: 0,
                    name: poster,
                    expiredDay: effectiveDate,
                    files: filejson
                }, function (err) {
                    if (err) {
                        logger.error(err);
                        res.end("ERROR");
                    }
                });
            } else {
                res.render("confirmation", {status: 1, name: null, expiredDay: null, files: null}, function (err) {
                    if (err) {
                        logger.error(err);
                        res.end("ERROR");
                    }
                });
            }

        }

    })
});


router.post('/yesPleaseShare', function (req, res) {
    var encrypt = req.body['id'];
    var id = crypto.aesDecrypt(encrypt);
    dbpool("select * from sharing where CONFIRMATION_ID = ? and isConfirmed = '0'", [id], function (err, rows) {
        if (err) {
            logger.log(err);
            res.end("ERROR");
        }
        if (rows.length == 0) {
            res.render("confirmation", {status: '1'});
        } else if (rows['expire_Day'] < formatDate(new Date())) {
            res.render("fileDeleted", {poster: rows['poster']});
        } else {
            mongo.update_sharing_confirmation_id(id, function (err, rows) {
                if (err) {
                    logger.log(err);
                    res.end("ERROR");
                } else {
                    res.render("confirmation", {name: rows['poster'], status: '0'});
                }
            });
            mongo.update_mail_confirmation(id, function (err, rows) {
                if (err) {
                    logger.log(err);
                    res.end("ERROR");
                }
            });
        }
    });
    res.end();
});

router.get("/download/:id", function (req, res) {
    var encrypt = req.params.id;
    var id = crypto.aesDecrypt(encrypt);
    var id2 = id.substring(0, 36);

    dbpool("select * from sharing where CONFIRMATION_ID = ? and isConfirmed = '1'", [id2], function (err, rows) {
        if (err) {
            logger.log(err);
            res.end("ERROR");
        }
        if (rows[0]['expire_Day'] < formatDate(new Date())) {
            res.render("fileDeleted", {poster: rows[0]['poster']});
        } else {
            var filejson = [];
            var FILE_NAME = rows[0]['FILE_NAME'];
            var FILE_SIZE = rows[0]['FILE_SIZE'];
            var _filesname = FILE_NAME.split('*');
            var _filessize = FILE_SIZE.split('*');
            for (var i = 0; i < _filesname.length; i++) {
                var _file = {name: _filesname[i], size: _filessize[i]};
                filejson.push(_file);
            }
            var effectiveDate = rows[0]['EXPIRE_DATE'];
            var poster = rows[0]['POSTER'];
            logger.info(poster);
            res.render("download", {
                poster: poster,
                expiredDay: effectiveDate,
                files: filejson,
                link: '/downloading/' + encrypt + '.zip'
            });
        }
    });
});

router.get("/downloading/:fileName", function (req, res) {
    var fileName = req.params.fileName;
    var confirmationId = fileName.substring(0, fileName.indexOf('.'));
    var file_location = "";
    var ip = getClientIp(req);
    var url = req.url;
    var theRequest = null;
    var email = null;
    if (url.indexOf("/upload/") != -1) {
        theRequest = url.substring(url.indexOf("/download/") + 10, url.length);
        email = crypto.aesDecrypt(theRequest).substring(36, id.length);
    }

    dbpool("select * from sharing where confirmation_id = ?", [confirmationId], function selectRes(err, rows) {
        if (err) {
            logger.error(err);
            res.end("ERROR");
        } else {
            if (rows.length > 0) {
                file_location = rows[0]['FILE_LOCATION'];
                res.download(file_location + '.zip');
                dbpool("INSERT INTO FILE_DOWNLOAD(ID, DOWNLOADER, fileId, update_time, download_times, downloadIp)VALUES(?,?,?,?,?,?)", [uuid.v1(), email, rows[0]['ID'], new Date(), '1', ip], function (err, rows) {
                    if (err) {
                        logger.error(err);
                    }
                })
            }

        }

    });
    mongo.query_sharing_with_confirmation_id({"CONFIRMATION_ID": confirmationId}, function (err, rows) {
        if (err) {
            logger.error(err);
            res.end("ERROR");
        } else {
            rows.forEach(function (row) {
                file_location = row['FILE_LOCATION'];
                res.download(file_location + '.zip');
                var data = [{
                    "ID": uuid.v1(),
                    'DOWNLOADER': email,
                    'fileId': row['ID'],
                    'update_time': 'new Date()',
                    'download_times': 1,
                    'downloadIp': ip
                }];
                mongo.insert_file_download(data, function (err, res) {
                    if (err) {
                        logger.error(err);
                    }
                });
            });
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