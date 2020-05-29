const sequelize = require("sequelize");

class Connection {
    constructor(){
      var url="";
      // url ='mysql://94B8sdwUHO:uAs7mEAtFS@remotemysql.com:3306/94B8sdwUHO';
        this.con = new sequelize('3ddxDB','root', 'root', {
          host: 'localhost',
          dialect: 'mysql' ,
          "logging": false,
            define: {
              timestamps: false
            }
          }
          );
   this.con.authenticate()
    .then(() => {
     console.log('Connection to database has been established successfully.');
     })
    .catch(err => {
    console.error('sorry Unable to connect to the database');
  });
    } 
}
var obj= new Connection();
module.exports=obj.con;
