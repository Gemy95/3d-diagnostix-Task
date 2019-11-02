var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
var port = process.env.PORT || 8080;

var passport = require('passport');
var flash = require('connect-flash');

var Student=require("./models/student");

var Teacher=require("./models/teacher");



require('./config/passport')(passport,Student,Teacher);


//app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json({limit: '50mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
 
app.set('view engine', 'ejs');

app.use(session({
 secret: 'justasecret',
 resave:true,
 saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(express.static('/public'));

require('./app/loginAndRegisterRoutes.js')(app, passport);




app.listen(port,function(){
    console.log("server is listening on Port: " + port)
});
