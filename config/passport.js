
var LocalStrategy = require("passport-local").Strategy;

var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var fs = require('fs');
var connection = mysql.createConnection(dbconfig.connection);

var type;

connection.query('USE ' + dbconfig.database);

module.exports = function(passport) {
 passport.serializeUser(function(user, done){
  done(null, user.ID);
 });

 passport.deserializeUser(function(ID, done){
  connection.query("SELECT * FROM "+type+" WHERE ID = ? ", ID,
   function(err, rows){
    done(err, rows[0]);
   });
 });

 passport.use(
  'local-signup',
  new LocalStrategy({
    usernameField : 'email',
    passwordField: 'password',
    passReqToCallback: true
   },
   function(req, email, password, done){
    type=req.body.type;
   connection.query("SELECT * FROM "+type+" WHERE email = ? ", 
   email, function(err, rows){
    if(err)
     return done(err);
    if(rows.length){
     return done(null, false, req.flash('signupMessage', 'That is already taken'));
    }else{
     var obj = {
      firstName:req.body.firstName,
      lastName:req.body.lastName,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, null, null)
     };
     var directory;
     if(type=="students")
     directory="uploadedStudentImages";
     else
     directory="uploadedTeacherImages";

     try {
      const pathImage = './public/'+directory+'/'+'image-'+Date.now()+'.jpg'
      const image = req.body.image; 
      const base64Data = image.replace(/^data:([A-Za-z-+/]+);base64,/, '');
      fs.writeFileSync(pathImage, base64Data,  {encoding: 'base64'});
      obj.image=pathImage.split('./public')[1];
     }
     catch(e)
     {
       console.log(e);
      return done(null, false, req.flash('signupMessage', 'error occurred from adding image'));
     }

     var insertQuery = "INSERT INTO "+type+" (firstName,lastName,email,image,password) values (?,?,?,?,?)";

     connection.query(insertQuery, [obj.firstName,obj.lastName,obj.email,obj.image,obj.password],
      function(err, row){
        if(err){
          return done(null, false, req.flash('signupMessage', 'error occurred'));
         }
       obj.ID = row.insertId;
       return done(null, obj);
      });
    }
   });
  })
 );

 passport.use(
  'local-login',
  new LocalStrategy({
   emailField : 'email',
   passwordField: 'password',
   passReqToCallback: true
  },
  function(req, email, password, done){
    type=req.body.type;
   connection.query("SELECT * FROM "+type+" WHERE email = ? ",email,
   function(err, rows){
     console.log(rows[0]);
    if(err)
     return done(err);
    if(!rows.length){
     return done(null, false, req.flash('loginMessage', 'No User Found'));
    }
    if(!bcrypt.compareSync(password, rows[0].password))
     return done(null, false, req.flash('loginMessage', 'Wrong Password'));

    return done(null, rows[0]);
   });
  })
 );
};