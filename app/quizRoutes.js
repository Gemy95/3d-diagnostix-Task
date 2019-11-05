module.exports = function(app,passport,Quiz,Question,con) {

  app.get('/addQuiz', isLoggedIn, function(req, res){
    var result = [];
    result["user"]=req.user;
        res.render('addQuiz.ejs', {
         data:result
        });
    });

    app.post('/addQuiz', isLoggedIn, function(req, res){
      var quiz= req.body.quiz;
      var allQuestions=req.body.allQuestions;

     con.transaction().then(transaction => {
      return  Quiz.create({
        "name":quiz.name,
        "code":quiz.code,
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
        .then(() => {
          transaction.commit();
         res.status(200).json({
           status:true,
           message:"added successfully"
         })
        })
        .catch(() => {
          transaction.rollback();
          res.status(200).json({
            status:false,
            message:"added failed"
          })
        });
    })
   
});


app.post('/saveQuiz', isLoggedIn, function(req, res){
  var quiz= req.body.quiz;
  var allQuestions=req.body.allQuestions;

 con.transaction().then(transaction => {
  return  Quiz.create({
    "name":quiz.name,
    "code":quiz.code,
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
    .then(() => transaction.commit())
    .catch(() => transaction.rollback());
   })
});


app.get("/getMyPublishedQuizes/:page", isLoggedIn,function(req,res) {
var teacherID=req.user.ID;
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
    ['ID', 'DESC']],
    where:{"teacherID":teacherID,"isReady":1}
    }).then(function (result) {
      result=result;
      data["user"]=req.user;
      data["count"]=Math.ceil(count/(perPage*1.0));
      data["result"]= result;
      //console.log(data);
      res.render("publishedQuizes.ejs",{
        data:data
       });
    }).catch((err)=>{result=-1})
}).catch((err)=>{
  count=-1;
});

})


app.get("/getSingleQuiz/:id", isLoggedIn,function(req,res) {
  var quizID=req.params.id;
  var result=[];
  result["user"]=req.user;
  con.transaction().then(transaction => {
    return Quiz.findOne({
      raw: true,
      where:{"ID":quizID}
    }, {transaction})
      .then((data)=>{
       result["quiz"]=data;
       return Question.findAll({
        raw: true,
        where:{"quizID":quizID}
      }, {transaction})
      })
      .then((data2) => {
        //console.log("success")
        result["questions"]=data2;
        transaction.commit()
        res.render("showSingleQuiz",{data:result});
      })
      .catch(() => {
        //console.log("error")
        transaction.rollback();
        res.render("showSingleQuiz",{data:result});
      });
  })
})


app.get("/getMySavedQuizes/:page",isLoggedIn,function(req,res) {
  var teacherID=req.user.ID;
  var page=req.params.page;
  var count=0,result="";
  var perPage=4;
  var Offset=perPage*page;
  var data=[];
  data["user"]=req.user;

  Quiz.count({
    raw: true,
    where:{"isReady":0,"teacherID":teacherID}
  })
  .then(function(count) {
      count=count;
      Quiz.findAll({
        raw: true,
        offset:Offset, limit:perPage,
       order: [
      ['ID', 'ASC']],
      where:{"teacherID":teacherID,"isReady":0}
      }).then(function (result) {
        result=result;
        data["count"]=Math.ceil(count/(perPage*1.0));
        data["result"]= result;
        //console.log(data);
        res.render("savedQuizes.ejs",{
          data:data
         });
      }).catch((err)=>{
        res.render("savedQuizes.ejs",{
          data:data
         });
      })
  }).catch((err)=>{
    res.render("savedQuizes.ejs",{
      data:data
     });
  });
  
 })

 
 app.get("/deleteSingleQuiz/:quzid/:teacherid",isLoggedIn,function(req,res) {
  var quizID=req.params.quzid;
  var teacherID=req.params.teacherid;

  return con.transaction().then(function (t) {
     Question.destroy({
      where: {
         quizID: quizID 
      }
     }
     , {transaction: t}).then(function (user) {
      return  Quiz.destroy({
        where: {
           ID: quizID 
        }
       }, {transction: t});
    }).then(function () {
      t.commit();
      res.redirect("/getMySavedQuizes/"+teacherID+"/0");
    }).catch(function (err) {
      t.rollback();
      res.redirect("/getMySavedQuizes/"+teacherID+"/0");
    });
  });

 })
  

 app.get("/publishFromSavedQuizes/:quizid/:teacherid",function (req,res) {
  var quizID=req.params.quizid;
  var teacherID=req.params.teacherid;

  Quiz.update({
    "isReady":1},{
      returning: true,
      where: {"ID":quizID}
  }).then((data)=>{
    res.redirect("/getMySavedQuizes/"+teacherID+"/0");
  }).catch((err)=>{
    res.redirect("/getMySavedQuizes/"+teacherID+"/0");
  })
  
 });



 app.get("/getToUpdateFromSavedQuizes/:id", isLoggedIn,function(req,res) {
  var quizID=req.params.id;
  var result=[];
  result["user"]=req.user;
  con.transaction().then(transaction => {
    return Quiz.findOne({
      raw: true,
      where:{"ID":quizID}
    }, {transaction})
      .then((data)=>{
       result["quiz"]=data;
       return Question.findAll({
        raw: true,
        where:{"quizID":quizID}
      }, {transaction})
      })
      .then((data2) => {
        //console.log("success")
        result["questions"]=data2;
        transaction.commit()
        res.render("editSavedQuiz",{data:result});
      })
      .catch(() => {
        //console.log("error")
        transaction.rollback();
        res.render("editSavedQuiz",{data:result});
      });
  })
})


app.post('/UpdateFromSavedQuizes/:id', isLoggedIn, function(req, res){
  var quiz= req.body.quiz;
  var allQuestions=req.body.allQuestions;
  var quizID=req.params.id;

 con.transaction().then(transaction => {
  return Quiz.update({
    "name":quiz.name,
    "code":quiz.code,
    "category":quiz.category,
    "isReady":0
    } ,{
    returning: true,
    where: {"ID":quizID} 
    }, {transaction})
    .then((result)=>{
   return Question.destroy({
      where:{"quizID":quizID}
    }, {transaction})  
    })
    .then((result)=>{
      for(let i=0;i<allQuestions.length;i++)
      {
        allQuestions[i].quizID=quizID;
      }
     return Question.bulkCreate(
         allQuestions, {transaction}
    )})
    .then(() => { 
      transaction.commit();
      //console.log("success")
    res.redirect("/getToUpdateFromSavedQuizes/"+quizID);
    })
    .catch(() =>{ 
      transaction.rollback();
      //console.log("failed");
      res.redirect("/getToUpdateFromSavedQuizes/"+quizID);
    });
   })
});



app.post('/publishFromSavedQuizes/:id', isLoggedIn, function(req, res){
  var quiz= req.body.quiz;
  var allQuestions=req.body.allQuestions;
  var quizID=req.params.id;

 con.transaction().then(transaction => {
  return Quiz.update({
    "name":quiz.name,
    "code":quiz.code,
    "category":quiz.category,
    "isReady":1
    } ,{
    returning: true,
    where: {"ID":quizID} 
    }, {transaction})
    .then((result)=>{
   return Question.destroy({
      where:{"quizID":quizID}
    }, {transaction})  
    })
    .then((result)=>{
      for(let i=0;i<allQuestions.length;i++)
      {
        allQuestions[i].quizID=quizID;
      }
     return Question.bulkCreate(
         allQuestions, {transaction}
    )})
    .then(() => { 
      transaction.commit();
      //console.log("success")
    //res.redirect("/getToUpdateFromSavedQuizes/"+quizID);
    res.status(200).json({
      status:true,
      message:"success"
    })
    })
    .catch(() =>{ 
      transaction.rollback();
      //console.log("failed");
      //res.redirect("/getToUpdateFromSavedQuizes/"+quizID);
      res.status(200).json({
        status:false,
        message:"failed"
      })
    });
   })
});


app.get("/getAllQuizesCategory",isLoggedIn,function (req,res) {
  var result=[];
  result["user"]=req.user;
  Quiz.aggregate('category', 'DISTINCT', { plain: false })
  .then((data)=> {
    result["categories"]=data;
    result["status"]=true;
    //console.log("categories="+JSON.stringify(data));
    res.render("quizesCategory",{data:result})
}).catch((err)=>{
    result["status"]=false;
    res.render("quizesCategory",{data:result})
});  
})


app.get("/getAllQuizesBYCategory/:category/:page",isLoggedIn,function (req,res) {
  var category=req.params.category;
  var perPage=4;
  var page=req.params.page;
  var Offset=perPage*page;
  var result=[];
  result["user"]=req.user;

  //console.log("category="+category);

   Quiz.findAll({
     row:true,
     offset:Offset,limit:perPage,
     where:{"isReady":1,"category":category}
   })
  .then((data)=> {
    result["quizes"]=data;
      Quiz.count({
       row:true,
       where:{"isReady":1,"category":category}
      }).then((count)=>{
        result["count"]=count;
        res.render("showQuizes",{data:result})
      }).catch((err)=>{
        res.render("showQuizes",{data:""})
      })
}).catch((err)=>{
    res.render("showQuizes",{data:""})
});  
})



app.get("/startQuiz/:id",function(req,res){
var quizID=req.params.id;
var result=[];
result["user"]=req.user;
Quiz.findOne({
  row:true,
  where:{"ID":quizID}
}).then((data)=>{
  result["status"]=true
  result["quiz"]=data;
  Question.findAll({
    row:true,
    where:{"quizID":quizID}
  }).then((data)=>{
    result["questions"]=data;
    res.render("startQuiz",{"data":result})
  }).catch((err)=>{
    result["status"]=false
    res.render("startQuiz",{"data":data})
  })
    
}).catch((err)=>{
  result["status"]=false
  res.render("startQuiz",{"data":data})
})
})


app.post("/getStudentResult/:id",function(req,res){
  var quizID=req.params.id;
  var responses=req.body;
  var result=[];
  var count=0;
  var correctedAnswer=0;
  var incorrectedAnswer=0;
  var percentage=0;
  var spentTime=req.body.spentTime;

  for(let [index,value] of Object.values(responses).entries()){
    result[count]=value;
    count++;
    
  }
  
  
  result["user"]=req.user;
  Question.findAll({
    row:true,
    where:{"quizID":quizID}
  }).then((data)=>{
    for(let j=0;j<result.length-1;j++)
    {
       if(data[j]['correct']==result[j])
       {
         correctedAnswer++;
       }
       else
       {
        incorrectedAnswer++;
       }
    }
  
    percentage=(correctedAnswer/(correctedAnswer+incorrectedAnswer))*(100.0);
  
    result["output"]={"correctedCount":correctedAnswer,"incorrectedCount":incorrectedAnswer,"percentage":percentage,"spentTime":spentTime}
    result["status"]=true;
    res.render("showResult",{data:result});
  }).catch((err)=>{
    result["status"]=false;
    res.render("showResult",{data:result});
  })
  
  })

///end of function
}


function isLoggedIn(req, res, next){
    if(req.isAuthenticated())
     return next();
   
    res.redirect('/');
}