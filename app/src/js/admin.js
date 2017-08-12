 var domain = "http://auth.swaathii.hasura.me";
 var request = require('request');
 var config = require('./config.js');
 

 function getToken(){
   return config.TOKEN;
 }

 function genToken(callback){
   var send = {
     "username": process.env.ADMIN_USER,
     "password": process.env.ADMIN_PASS
   }
   var options = {
     method: 'POST',
     url: domain+'/login',
     json: true,
     body: send
   }
   request(options, function(error, response, body){
     if(error){
       console.log(error);
       callback("Error");
     }else{
       callback(body.auth_token);
     }
   });
 }

 module.exports = {getToken, genToken};