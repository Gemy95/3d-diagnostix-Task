const connection=require("./connection");
const Sequelize = require("sequelize");
const Model = Sequelize.Model;
const con = connection;
const Quiz=require("./quiz");

class Teacher extends Model {
   
}

Teacher.init({
  // attributes
  ID: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false
  }
  ,
  age: {
    type: Sequelize.STRING,
    allowNull: false
  }
  ,
  email: {
    type: Sequelize.STRING,
    allowNull: false
  }
  ,
  image: {
    type: Sequelize.STRING,
    allowNull: false
  }
  ,
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
  ,
  phoneNumber: {
    type: Sequelize.STRING,
    allowNull: false
  }
  ,
  address: {
    type: Sequelize.STRING,
    allowNull: false
  }
  ,
  type: {
    type: Sequelize.STRING,
    allowNull: false
  }
}

, {
    sequelize:con,
    modelName: 'teacher'
  });


  Teacher.hasMany(Quiz);
  Quiz.belongsTo(Teacher);
  
  module.exports=Teacher;