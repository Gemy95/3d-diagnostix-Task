module.exports = function(app,passport,Quiz,Question,con) {

  app.get('/addQuiz', isLoggedIn, function(req, res){
        res.render('addQuiz.ejs', {
         user:req.user
        });
    });

    app.post('/addQuiz', isLoggedIn, function(req, res){
      var quiz= req.body.quiz;
      var allQuestions=req.body.allQuestions;
      console.log("quiz name="+req.body.quiz.name);
      console.log("quiz category="+req.body.quiz.category);
      console.log("req.user.ID="+req.user.ID);
      return con.transaction(t => {
        // chain all your queries here. make sure you return them.
        return Quiz.create({
          "name":quiz.name,
          "category":quiz.category,
          "isReady":quiz.isReady,
          "teacherID":req.user.ID
        }, {transaction: t})
      
      }).then(result => {
        // Transaction has been committed
        // result is whatever the result of the promise chain returned to the transaction callback
        res.status(200).json({
          status:true,
          "ID":result.ID,
          "message":"success added quiz"
        })
      }).catch(err => {
        // Transaction has been rolled back
        // err is whatever rejected the promise chain returned to the transaction callback
        console.log(err);
        res.status(200).json({
          status:false,
          "message":"error"
        })
      });
    });

}

function isLoggedIn(req, res, next){
    if(req.isAuthenticated())
     return next();
   
    res.redirect('/');
}