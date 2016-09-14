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

//conn.query('create database ' + TEST_DATABASE);

conn.query("use " + TEST_DATABASE);


// conn.query("CREATE TABLE sharing (idsharing INT(11) AUTO_INCREMENT, poster varchar(45) NOT NULL,file_location VARCHAR(400) NULL DEFAULT NULL,file_original_name VARCHAR(450) NULL DEFAULT NULL,mails VARCHAR(450) NULL DEFAULT NULL, creation_date DATETIME NULL DEFAULT NULL,  expire_date DATETIME NULL DEFAULT NULL, status int, PRIMARY KEY (idsharing) ) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8");
//
// conn.query("CREATE TABLE mail_to (sharing_id INT(11) NULL DEFAULT NULL,user_id INT(11) NULL DEFAULT NULL) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8");

conn.query("CREATE TABLE SHARING (ID INT(11)  NOT NULL AUTO_INCREMENT, POSTER VARCHAR(50) NOT NULL, FLIE_LOCATION VARCHAR(400) NULL ,FILE_NAME VARCHAR(100) NULL ,CREATION_DATE DATETIME NULL DEFAULT current_timestamp() , EXPIRE_DATE DATETIME NULL , STATUS CHAR(1) NULL DEFAULT '0', FILE_SIZE VARCHAR(10)NULL , POSTER_IP VARCHAR(20) NULL  , PRIMARY KEY (ID) ) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8");

conn.query("CREATE TABLE MAIL_TO (ID VARCHAR(30) NOT NULL ,EMAIL_POSTER VARCHAR(50) NULL , EMAIL_RECEIVER VARCHAR(600) NULL , EMAIL_SUBJECT VARCHAR(100) NULL , EMAIL_CONTENT TEXT NULL , EMAIL_STATUS VARCHAR(1) NULL DEFAULT 0, EMAIL_SENDCOUNT INT(4) NULL DEFAULT 0, EMAIL_CREATETIME DATETIME NULL DEFAULT current_timestamp() , EMAIL_SENDTIME DATETIME NULL ) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8");

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
conn.query("CREATE TABLE FILE_DOWNLOAD (id INT(11) NULL DEFAULT NULL,down_loader varchar(45) NULL ,file varchar(100) NULL,update_time DATETIME,download_times int Null) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8");

conn.end(function (err) {
   if (err){
       console.log(err);
   }
});
