const express = require('express');
const user_route = express();
const session = require('express-session');

const config = require('../config/config')

user_route.use(session({secret:config.sessionSecret, resave: false, saveUninitialized: false}));

const auth = require('../middleware/auth');

user_route.set('view engine', 'ejs');
user_route.set('views', './views/users')

const bodyParser = require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}))

const multer = require('multer');
const path = require('path');

user_route.use(express.static('public'))

//Load Static css style
user_route.use('/static', express.static(path.join(__dirname, '../public')));

const storage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, path.join(__dirname, '../public/userImages'))
    },
    filename:function(req, file, cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null, name);
    }
});
const upload = multer({storage:storage});

const userController = require('../controllers/userController');

user_route.get('/register',auth.isLogout, auth.nocache, userController.loadRegister);

user_route.post('/register',upload.single('image'), userController.insertUser);

user_route.get('/',auth.isLogout, auth.nocache, userController.loginLoad);
user_route.get('/login',auth.isLogout, auth.nocache, userController.loginLoad);

user_route.post('/login', userController.verifyLogin);
user_route.get('/home',auth.isLogin, auth.nocache, userController.loadHome);

user_route.get('/logout',auth.isLogin, auth.nocache, userController.userLogout)

user_route.get('/edit', auth.isLogin, auth.nocache, userController.editLoad);

user_route.post('/edit', upload.single('image'), userController.updateProfile);

module.exports = user_route;