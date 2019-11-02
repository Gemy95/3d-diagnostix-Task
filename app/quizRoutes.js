module.exports = function(app) {

  app.get('/addQuiz', isLoggedIn, function(req, res){
        res.render('addQuiz.ejs', {
         user:req.user
        });
    });

    app.post('/addQuiz', isLoggedIn, function(req, res){
      console.log(req.body);
    });

}

function isLoggedIn(req, res, next){
    if(req.isAuthenticated())
     return next();
   
    res.redirect('/');
}