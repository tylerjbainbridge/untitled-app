//Modules
var express = require('express'),
    passport = require('passport'),
    validator = require('validator'),
    multer = require('multer');

var AccountController = require('./controllers/account');
var IntCont = require('./controllers/interaction');
var ImageController = require('./controllers/image');

//Router
var router = express.Router();

/**
 * Image Upload.
 */
var storage = multer.memoryStorage({
    dest: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '.jpg'); //Appending .jpg
    }
});

var uploader = multer({
    storage: storage
});

router.get('/', function (req, res) {
    res.render('index', {title:"home"});
});

router.get('/register', function (req, res) {
    res.render('register', {title:"register"});
});

router.get('/img', function (req, res) {
    res.render('img', {title:"img"});
});

router.get('/login', function (req, res) {
    res.render('/login-register/login', {title:"login"});
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/loggedin', function (req, res) {
    res.send(req.isAuthenticated() ? req.user : '0');
});

/**
 * ACCOUNT
 */

router.get('/u/:username', AccountController.getUserProfile);

router.get('/u/:username/i', AccountController.getUserImages);

router.get('/feed', AccountController.getUserFeed);

router.post('/register', AccountController.createAccount);

router.post('/login', AccountController.login);

router.post('/newFit', AccountController.newFit);

/**
 * INTERATION
 */

router.post('/like/:img_short', IntCont.likeImage);

router.post('/unLike/:img_short', IntCont.unLikeImage);

router.post('/comment/i/:img_short', IntCont.comment);

router.post('/delete/comment/:comment_id', IntCont.comment);

router.post('/follow/:user_id', IntCont.follow);

router.post('/unfollow/:user_id', IntCont.unfollow);

/**
 * IMAGES
 */

router.get('/i/:img_short', ImageController.getImage);

router.post('/upload', uploader.single('file'), ImageController.uploadImage);

router.post('/testNewImage', ImageController.testImage);

router.post('/deleteAll', ImageController.deleteAllImages);

router.post('/delete/image/:image_id', ImageController.deleteImage);


//404 handling
router.use(function (req, res) {
    res.render('404');
});

module.exports = router;