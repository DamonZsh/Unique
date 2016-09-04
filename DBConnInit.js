/**
 * this is used to test db connection
 */

var http = require('http');
var mysql = require('mysql');
var conn = null;

var TEST_DATABASE = "nodejs";
var TEST_TABLE = "fileTable";

var options = {
	host : 'localhost',
	port : '3306',
	user : 'root',
	password : 'root'
};

conn = mysql.createConnection(options);
conn.connect(function(err) {
	if (err) {
		console.error("connect db " + options.host + " error: " + err);
		process.exit();
	}
});

conn.query('create database ' + TEST_DATABASE);

conn.query("use " + TEST_DATABASE);

conn.query("create table " + TEST_TABLE
		+ "(id INT(11) AUTO_INCREMENT, name varchar(255), primary key (id) )");

conn.query("insert into " + TEST_TABLE + "(name) values ('nodejs_1')");

conn.query("insert into " + TEST_TABLE + "(name) values ('nodejs_2')");


conn.query("CREATE TABLE IF NOT EXISTS `mydb`.`user` (`username` (16) NOT NULL, `email` (255) NULL, `password` (32) NOT NULL, `create_time`  NULL DEFAULT CURRENT_TIMESTAMP)");

conn.query("CREATE TABLE IF NOT EXISTS `nodejs`.`sharing_copy1` (`idsharing` INT(11) NOT NULL AUTO_INCREMENT,`user_id` INT(11) NOT NULL,`file_location` VARCHAR(400) NULL DEFAULT NULL,`file_original_name` VARCHAR(450) NULL DEFAULT NULL,`save_time` INT(11) NULL DEFAULT NULL,`creation_date` DATETIME NULL DEFAULT NULL,PRIMARY KEY (`idsharing`),UNIQUE INDEX `idsharing_UNIQUE` (`idsharing` ASC)) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8");

conn.query("CREATE TABLE IF NOT EXISTS `nodejs`.`mail_to_copy1` (`sharing_id` INT(11) NULL DEFAULT NULL,`user_id` INT(11) NULL DEFAULT NULL) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8");

conn.query("select * from  " + TEST_TABLE,
		function select(err, results, fields) {
			if (err) {
				throw err;
			}
			console.log(err);
			console.log(results);
			console.log(fields);
});