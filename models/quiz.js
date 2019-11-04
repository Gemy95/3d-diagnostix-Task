const connection=require("./connection");
const Sequelize = require("sequelize");
const Model = Sequelize.Model;
const con = connection;

class Quiz extends Model {
   
}

Quiz.init({
  // attributes
  ID: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  category: {
    type: Sequelize.STRING,
    allowNull: false
  }
  ,
  code: {
    type: Sequelize.STRING,
    allowNull: false
  }
  
  ,
  teacherID: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
  ,
  isReady: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  }
  ,
  creationDate: {
    type: Sequelize.DATE,
    allowNull: true
  }

}

, {
    sequelize:con,
    modelName: 'quize'
  });

   

  module.exports=Quiz;