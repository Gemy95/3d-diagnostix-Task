const connection=require("./connection");
const Sequelize = require("sequelize");
const Model = Sequelize.Model;
const con = connection;
const Quiz=require("./quiz");

class Question extends Model {
   
}

Question.init({
  // attributes
  ID: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  answer1: {
    type: Sequelize.STRING,
    allowNull: false
  },
  answer2: {
    type: Sequelize.STRING,
    allowNull: false
  }
  ,
  answer3: {
    type: Sequelize.STRING,
    allowNull: false
  }
  ,
  answer4: {
    type: Sequelize.STRING,
    allowNull: false
  }
  ,
  correct: {
    type: Sequelize.STRING,
    allowNull: false
  }
  ,
  explaination	: {
    type: Sequelize.STRING,
    allowNull: false
  }
  ,
  creationDate: {
    type: Sequelize.DATE,
    allowNull: false
  },
  quizID:
  {
    type: Sequelize.INTEGER,
    allowNull: false
  }

}

, {
    sequelize:con,
    modelName: 'quize'
  });

  Question.belongsTo(Quiz); 
  Quiz.hasMany(Question); 

  module.exports=Question;