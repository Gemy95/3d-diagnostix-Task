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


app.post('/saveQuiz', isLoggedIn, function(req, res){
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


app.get("/getMyPublishedQuizes/:id/:page",function(req,res) {
var teacherID=req.params.id;
var page=req.params.page;
var count=0,result="";
var perPage=4;
var Offset=perPage*page;
var data=[];

Quiz.count({
  raw: true,
  where:{"isReady":1,"teacherID":teacherID}
})
.then(function(count) {
    count=count;
    Quiz.findAll({
      raw: true,
      offset:Offset, limit:perPage,
     order: [
    ['ID', 'ASC']],
    where:{"teacherID":teacherID}
    }).then(function (result) {
      result=result;
      data["user"]=req.user;
      data["count"]=count;
      data["result"]= result;
      console.log(data);
      res.render("publishedQuizes.ejs",{
        data:data
       });
    }).catch((err)=>{result=-1})
}).catch((err)=>{
  count=-1;
});


})


///end of function
}


function isLoggedIn(req, res, next){
    if(req.isAuthenticated())
     return next();
   
    res.redirect('/');
}