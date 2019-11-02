
var LocalStrategy = require("passport-local").Strategy;

var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');

var type;

module.exports = function(passport,Student,Teacher) {
 passport.serializeUser(function(user, done){
  done(null, user.ID);
 });

 passport.deserializeUser(function(ID, done){
  var model;
  if(type=="students")
    model=Student
  else
    model=Teacher

  model.findAll({
      limit: 1,
      where: {
           "ID":ID
      }
    }).then(function(rows){
      done(null, rows[0]);
    }).catch( (err)=>{ done(err,null) } ); 
  
  });

  //////////////////////////////////////////////////////////////////////////
  ////////////////////////////local signup//////////////////////////////////
 passport.use(
  'local-signup',
  new LocalStrategy({
    usernameField : 'email',
    passwordField: 'password',
    passReqToCallback: true
   },
   function(req, email, password, done){
    type=req.body.type;
    var model;var directory;
    if(type=="students")
    {
    model=Student;
    directory="uploadedStudentImages";
    }
    else
    {
    model=Teacher;
    directory="uploadedTeacherImages";
    }
    model.findAll({
      where:{
        "email":email
      }
    })
    .then((rows)=>{
      if(rows.length){
        return done(null, false, req.flash('signupMessage', 'That is already taken'));
       }
       else{
        var obj = {
         firstName:req.body.firstName,
         lastName:req.body.lastName,
         email: req.body.email,
         password: bcrypt.hashSync(req.body.password, null, null)
        };
   
        try {
         const pathImage = './public/'+directory+'/'+'image-'+Date.now()+'.jpg'
         const image = req.body.image; 
         const base64Data = image.replace(/^data:([A-Za-z-+/]+);base64,/, '');
         fs.writeFileSync(pathImage, base64Data,  {encoding: 'base64'});
         obj.image=pathImage.split('./public')[1];
        }
        catch(e)
        {
         return done(null, false, req.flash('signupMessage', 'error occurred from adding image'));
        }
   
        model.create({
         firstName:obj.firstName,
         lastName:obj.lastName,
         email: obj.email,
         password: obj.password,
         image:obj.image
        })
        .then((row)=>{
          obj.ID = row.ID;
          return done(null, obj);
        })
        .catch((err)=>{
          return done(null, false, req.flash('signupMessage', 'error occurred'));
        })

       }
    })
    .catch((err)=>{
      return done(err);
    })

  })
 );

 ////////////////////////////////////////////////////////////////////////////
 ///////////////////////////////local login//////////////////////////////////
 passport.use(
  'local-login',
  new LocalStrategy({
   emailField : 'email',
   passwordField: 'password',
   passReqToCallback: true
  },
  function(req, email, password, done){
    type=req.body.type;
    var model;
    if(type=="students")
    model=Student;
    else
    model=Teacher;
    
    model.findAll({
        limit:1,
        where:{
          "email":email
        }
      })
      .then((rows)=>{
        if(!rows.length){
          return done(null, false, req.flash('loginMessage', 'No User Found'));
         }
         if(!bcrypt.compareSync(password, rows[0].password))
          return done(null, false, req.flash('loginMessage', 'Wrong Password'));
     
         return done(null, rows[0]);
      }).catch((err)=>{
        return done(err);
      })
  
  })
 );
};