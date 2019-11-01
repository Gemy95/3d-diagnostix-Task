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
var studentObj=new Student();

require('./config/passport')(passport);

//app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
 extended: true
}));

// parse application/json
app.use(bodyParser.json());
 
app.set('view engine', 'ejs');

app.use(session({
 secret: 'justasecret',
 resave:true,
 saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./app/loginAndRegisterRoutes.js')(app, passport);
/*
student.create({
    firstName: 'John',
    lastName: 'Hancock',
    email:'emailaamdagsfkjags',
    password:"123",
    image:"111"
  }).then((user)=>{
      console.log("success")
  }).catch((e)=>{
      console.log("sorry")
  })
  */

  app.get("/getAll",function(req,res){
    Student.findAll().then(users => {
        res.status(200).json({
            status:true,
            message:users  
        })
    }).catch((e)=>{
        res.status(200).json({
            status:false,
            message:"not found"  
        })
    })
  })


app.listen(port,function(){
    console.log("server is listening on Port: " + port)
});
