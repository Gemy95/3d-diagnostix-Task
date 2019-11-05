module.exports = function(app, passport) {
 app.get('/', function(req, res){
  res.render('index.ejs',{data:{"user":[]}});
 });

 app.get('/login', function(req, res){
  res.render('login.ejs', {message:req.flash('loginMessage'),data:{"user":[]}});
 });

 app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
 }),
  function(req, res){
   if(req.body.remember){
    req.session.cookie.maxAge = 1000 * 60 * 3;
   }else{
    req.session.cookie.expires = false;
   }
   res.redirect('/');
  });

 app.get('/signup', function(req, res){
  res.render('signup.ejs', {message: req.flash('signupMessage'),data:{"user":[]}});
 });


 app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
 }));



 app.get('/profile', isLoggedIn, function(req, res){
     var result=[];
     result["user"]=req.user;
  res.render('profile.ejs', {
   data:result
  });
 });

 app.get('/logout', function(req,res){
  req.logout();
  res.redirect('/');
 })

};

function isLoggedIn(req, res, next){
 if(req.isAuthenticated())
  return next();

 res.redirect('/');
}