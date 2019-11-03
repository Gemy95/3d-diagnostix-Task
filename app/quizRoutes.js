module.exports = function(app,passport,Quiz,Question,con) {

  app.get('/addQuiz', isLoggedIn, function(req, res){
        res.render('addQuiz.ejs', {
         user:req.user
        });
    });

    app.post('/addQuiz', isLoggedIn, function(req, res){
      var quiz= req.body.quiz;
      var allQuestions=req.body.allQuestions;

     con.transaction().then(transaction => {
      return  Quiz.create({
        "name":quiz.name,
        "category":quiz.category,
        "isReady":quiz.isReady,
        "teacherID":req.user.ID
      })
        .then((result)=>{
          var quizID=result.ID;
          for(let i=0;i<allQuestions.length;i++)
          {
            allQuestions[i].quizID=quizID;
          }
         return Question.bulkCreate(
             allQuestions, {transaction}
        )})
        .then((data) => transaction.commit())
        .catch(() => transaction.rollback());
    })
   
});

}

function isLoggedIn(req, res, next){
    if(req.isAuthenticated())
     return next();
   
    res.redirect('/');
}