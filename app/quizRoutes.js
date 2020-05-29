module.exports = function(app,passport,Quiz,Question,Teacher,con) {

  /// teacher add quiz
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

//teacher save quiz
app.post('/saveQuiz', isLoggedIn, function(req, res){
  var quiz= req.body.quiz;
  var allQuestions=req.body.allQuestions;

 con.transaction().then(transaction => {
  return  Quiz.create({
    "name":quiz.name,
    "code":quiz.code,
    "category":quiz.category,
    "isReady":0,
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

/// teacher get his published quizzes
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
      res.render("publishedQuizes.ejs",{
        data:data
       });
    }).catch((err)=>{
      result=-1;
      console.log("err catch="+err);
    })
}).catch((err)=>{
  count=-1;
  console.log("err catch2="+err);
});

})

/// teacher show single quiz
app.get("/getSingleQuiz/:id", isLoggedIn,function(req,res) {
  var quizID=req.params.id;
  var result=[];
  result["user"]=req.user;
  con.transaction().then(transaction => {
    return Quiz.findOne({
      raw: true,
      where:{"ID":quizID,"teacherID":req.user.ID}
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

///teacher get his saved quizes
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

 ///teacher delete saved quiz
 app.get("/deleteSingleQuiz/:quzid",isLoggedIn,function(req,res) {
  var quizID=req.params.quzid;
  var teacherID=req.user.ID;

  return con.transaction().then(function (t) {
     Question.destroy({
      where: {
         quizID: quizID 
      }
     }
     , {transaction: t}).then(function (user) {
      return  Quiz.destroy({
        where: {
           "ID": quizID ,"teacherID":teacherID
        }
       }, {transction: t});
    }).then(function () {
      t.commit();
      res.redirect("/getMySavedQuizes/0");
    }).catch(function (err) {
      t.rollback();
      res.redirect("/getMySavedQuizes/0");
    });
  });

 })
  
///teacher publish from saved quizzes
 app.get("/publishFromSavedQuizes/:quizid",function (req,res) {
  var quizID=req.params.quizid;
  var teacherID=req.user.ID;

  Quiz.update({
    "isReady":1},{
      returning: true,
      where: {"ID":quizID}
  }).then((data)=>{
    res.redirect("/getMySavedQuizes/0");
  }).catch((err)=>{
    res.redirect("/getMySavedQuizes/0");
  })
  
 });


///teacher edit or publish saved quiz
 app.get("/getToUpdateFromSavedQuizes/:id", isLoggedIn,function(req,res) {
  var quizID=req.params.id;
  var result=[];
  result["user"]=req.user;
  con.transaction().then(transaction => {
    return Quiz.findOne({
      raw: true,
      where:{"ID":quizID,"teacherID":req.user.ID}
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
        console.log("questions="+data2);
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

/// teacher save his quiz
app.post('/UpdateFromSavedQuizes/:id', isLoggedIn, function(req, res){
  var quiz= req.body.quiz;
  var allQuestions=req.body.allQuestions;
  var quizID=req.params.id;
console.log("allQuestions="+JSON.stringify(allQuestions))
console.log("quiz="+JSON.stringify(quiz));

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


////teacher publish form saved quiz
app.post('/publishFromEditSavedQuizes/:id', isLoggedIn, function(req, res){
  var quiz= req.body.quiz;
  var allQuestions=req.body.allQuestions;
  var quizID=req.params.id;

 con.transaction().then(transaction => {
  return Quiz.update({
    "name":quiz.name,
    "code":quiz.code,
    "category":quiz.category,
    "isReady":1,
    where:{"teacherID":req.user.ID}
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

///student get all subject's quizzes
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

/// student show all quizes that related to one subject
app.get("/getAllQuizesBYCategory/:category/:page",isLoggedIn,function (req,res) {
  var category=req.params.category;
  var perPage=4;
  var page=req.params.page;
  var Offset=perPage*page;
  var result=[];
  result["user"]=req.user;
   Quiz.findAll({
     row:true,
     offset:Offset,limit:perPage,
     where:{"isReady":1,"category":category}
   })
  .then((data)=> {
    result["quizes"]=data;
    var count=data.length+1;
    result["count"]=Math.ceil((count/4.0));
    res.render("showQuizes",{data:result})
}).catch((err)=>{
    res.render("showQuizes",{data:result});
});  
})


///student start quiz
app.get("/startQuiz/:id",function(req,res){
var quizID=req.params.id;
var result=[];
result["user"]=req.user;
Quiz.findOne({
  row:true,
  where:{"ID":quizID}
}).then((data1)=>{
  result["status"]=true
  result["quiz"]=data1;
  Question.findAll({
    row:true,
    where:{"quizID":quizID}
  }).then((data2)=>{
    result["questions"]=data2;
         Teacher.findOne({
           row:true,
           where:{"ID":data1.teacherID}
         }).then((data3)=>{
            result["teacher"]=data3;
          res.render("startQuiz",{"data":result})  
         }).catch((err)=>{
          res.render("startQuiz",{"data":result})  
         })

  }).catch((err)=>{
    result["status"]=false
    res.render("startQuiz",{"data":data})
  })
    
}).catch((err)=>{
  result["status"]=false
  res.render("startQuiz",{"data":data})
})
})

//student get his quiz result
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

///middleware to check authentication by passport
function isLoggedIn(req, res, next){
    if(req.isAuthenticated())
     return next();
   
    res.redirect('/');
}