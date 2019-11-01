const sequelize = require("sequelize");

class Connection {
    constructor(){
        this.con = new sequelize('mysql://94B8sdwUHO:uAs7mEAtFS@remotemysql.com:3306/94B8sdwUHO', {
            define: {
              timestamps: false
            }
          });
    } 
}
var obj= new Connection();
module.exports=obj.con;
