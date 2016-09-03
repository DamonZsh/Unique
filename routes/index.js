
/*
 * GET home page.
 */

//exports.index = function(req, res){
//	console.info(req);
//	console.info(res);
//  res.render('index', { title: 'Home' });
//};

var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res) {
  	res.render('index', { title: 'Welcome' });
});

/*login*/
router.get('/login', function(req, res) {
 	 res.render('login', { title: 'login' });
});

/*logout*/
router.get('/logout', function(req, res) {
  	res.render('logout', { title: 'logout' });
});

///*hompage*/
//router.post('/homepage', function(req, res) {
//	var query_doc = {userid: req.body.userid, password: req.body.password};
//	(function(){
//		user.count(query_doc, function(err, doc){
//			if(doc == 1){
//				console.log(query_doc.userid + ": login success in " + new Date());
//				res.render('homepage', { title: 'homepage' });
//			}else{
//				console.log(query_doc.userid + ": login failed in " + new Date());
//				res.redirect('/');
//			}
//		});
//	})(query_doc);
//});

module.exports = router;