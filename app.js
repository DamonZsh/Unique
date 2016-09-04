/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes/index'),
    share_routes = require('./routes/share')
http = require('http'),
    path = require('path'),
    favicon = require('serve-favicon'),
    cookieParser = require('cookie-parser'),
    logger = require('morgan'),
    bodyParser = require('body-Parser'),
    methodOverride = require('method-override'),
    errorHandler = require('error-handler'),
    url = require('url'),
    // form = require('connect-form'),
    ejs = require('ejs');

var app = express();
// var app = module.exports = express.createServer(form({ keepExtensions: true, uploadDir:'./uploads' }));
//var router = express.Router();
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('.html', require('ejs').renderFile);
app.set('view engine', 'html');
//app.use(favicon);
//定义日志和输出级别
app.use(logger('dev'));
//定义数据解析器
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
//app.use(router);
//定义cookie解析器
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/share', share_routes);
// development only
if ('development' === process.env.NODE_ENV) {
    app.use(errorHandler());
}


app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//开发环境，500错误处理和错误堆栈跟踪
if (process.env.NODE_ENV === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}


http.createServer(app).listen(app.get('port'), function () {
    console.info(__dirname);
    console.log('Express server listening on port ' + app.get('port'));
});
