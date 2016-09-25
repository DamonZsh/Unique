/**
 * Nicq chen
 */

var MongoClient = require("mongodb").MongoClient;
var DATABASE_CONNECTION_STR = "mongodb://localhost:27017/fileSharing";

var insert = function (data, coll, callback) {
    MongoClient.connect(DATABASE_CONNECTION_STR, function (err, db) {
        if (err) {
            console.log(err);
            return;
        }
        var collection = db.collection(coll);
        collection.insert(data, function (err, result) {
            callback(err, result);
        });
        db.close();
    });
};

var query = function (where, coll, callback) {
    MongoClient.connect(DATABASE_CONNECTION_STR, function (err, db) {
        if (err) {
            console.log(err);
            return;
        }
        var collection = db.collection(coll);
        collection.find(where).toArray(function (err, res) {
            callback(err, res);
        });
        db.close();
    });
};


var update = function (where, set, coll, callback) {
    MongoClient.connect(DATABASE_CONNECTION_STR, function (err, db) {
        if (err) {
            console.log(err);
            return;
        }
        var collection = db.collection(coll);
        collection.update(where, set, function (err, res) {
            if (err) {
                console.log(err);
            }
            callback(res);
        });
        db.close();
    });
};

exports.insert_sharing = function (data, callback) {
    insert(data, "sharing", callback);
};

exports.insert_mail_to = function (data, callback) {
    insert(data, "mailTo", callback);
};

exports.query_sharing_with_confirmation_id = function (where, callback) {
    query(where, "sharing", callback);
};

exports.update_expired_sharing = function (callback) {
    var where = {"EXPIRE_DATE": {$lt: 'new Date()'}, "STATUS": 0};
    var set = {$set: {"STATUS": 1}};
    update(where, set, 'sharing', callback)
};

exports.query_unsent_files = function (callback) {
    var where = {"EMAIL_SENDCOUNT": {$lt: 10}, "EMAIL_STATUS": 0, "ISCONFIRMED": '1'};
    query(where, 'mailTo', callback);
};

exports.update_mail_to_sent = function (id, callback) {
    var where = {"ID": id};
    var set = {$set: {"EMAIL_STATUS": 0}};
    update(where, set, 'mailTo', callback);
};

exports.update_sharing_confirmation_id = function (id, callback) {
    var where = {"CONFIRMATION_ID": id, "ISCONFIRMED":0};
    var set = {$set: {"ISCONFIRMED": 1}};
    update(where, set, 'sharing', callback);
};

exports.update_mail_confirmation = function (id, callback) {
    var where = {"SHARING_ID": id, "ISCONFIRMED":0};
    var set = {$set: {"ISCONFIRMED": 1}};
    update(where, set, 'mailTo', callback);
};

exports.insert_file_download= function (data, callback) {
  insert(data, 'FILE_DOWNLOAD', callback);
};



