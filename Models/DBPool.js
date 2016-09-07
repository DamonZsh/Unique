/**
 * to create a db connection pool
 */

var mysql = require('mysql');
var pool = mysql.createPool({
	host : 'localhost',
	port : '3306',
	user : 'root',
	password : 'root',
	database : 'nodejs'
});

var query=function(sql,callback){
    pool.getConnection(function(err,conn){
        if(err){
            callback(err,null,null);
        }else{
            conn.query(sql,function(qerr,vals,fields){
                console.info('query start, sql = ' + sql);
                //release the connection
                conn.release();
                console.info('query completed, released connection');
                //callback
                callback(qerr,vals,fields);
            });
        }
    });
};

module.exports=query;


//在js类使用如下
//var query=require("./lib/DBPool.js");
//
//query("select 1 from 1",function(err,vals,fields){
//    //do something
//});