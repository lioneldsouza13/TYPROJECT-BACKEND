const user= require('./../models').user;
const jwt = require('jsonwebtoken')

var authenticate =(req,res,next)=>{
var token1 = req.header('authorization');
    const decodedToken= jwt.verify(token1,process.env.JWT_SECRET,function(err,token){
           if(err)
           {
               res.status(401).send("Unauthorized");
               console.log("Unauthorized "+token1);
               return false;
           }
           else if(token)
           {
               console.log('Authorized');
               next();
           }
        }
    )


}

module.exports={authenticate}