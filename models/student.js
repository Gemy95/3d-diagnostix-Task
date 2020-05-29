var connection=require("./connection");
const Sequelize = require("sequelize");
const Model = Sequelize.Model;
const con = connection;

class Student extends Model {
   
}

Student.init({
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
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true
    }
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
  },
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
  ,
  gender: {
    type: Sequelize.STRING,
    allowNull: false
  }
}

, {
    sequelize:con,
    modelName: 'student'
  });




  module.exports=Student;