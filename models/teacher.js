var connection=require("./connection");
const Sequelize = require("sequelize");
const Model = Sequelize.Model;
const con = connection;

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
}

, {
    sequelize:con,
    modelName: 'teacher'
  });




  module.exports=Teacher;