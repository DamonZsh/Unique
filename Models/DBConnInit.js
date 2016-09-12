/**
 * this is used to test db connection
 */

var http = require('http');
var mysql = require('mysql');
var conn = null;

var TEST_DATABASE = "nodejs";
var TEST_TABLE = "fileTable";

var options = {
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'root'
};

conn = mysql.createConnection(options);
conn.connect(function (err) {
    if (err) {
        console.error("connect db " + options.host + " error: " + err);
        process.exit();
    }
});

conn.query('create database ' + TEST_DATABASE);

conn.query("use " + TEST_DATABASE);


conn.query("CREATE TABLE sharing (idsharing INT(11) AUTO_INCREMENT, poster varchar(45) NOT NULL,file_location VARCHAR(400) NULL DEFAULT NULL,file_original_name VARCHAR(450) NULL DEFAULT NULL,mails VARCHAR(450) NULL DEFAULT NULL, creation_date DATETIME NULL DEFAULT NULL,  expire_date DATETIME NULL DEFAULT NULL, status int, PRIMARY KEY (idsharing) ) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8");

conn.query("CREATE TABLE mail_to (sharing_id INT(11) NULL DEFAULT NULL,user_id INT(11) NULL DEFAULT NULL) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8");

//file down load monitor table
/*
* file_down{
* id int,
* down_loader varchar,
* file varchar,
* download_times int,
* update_time datetime
* }
* */
conn.query("CREATE TABLE file_download (id INT(11) NULL DEFAULT NULL,down_loader varchar(45) NULL DEFAULT NULL,file varchar(100) NULL DEFAULT NULL,update_time DATETIME NULL DEFAULT NULL,download_times int Null Default null) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8");

conn.end(function (err) {
   if (err){
       console.log(err);
   }
});
