const jwt =require("jsonwebtoken");
const NewSchema= require("../models/moschema")
const auth= async(req,resp,next)=>{
try {
    const token=req.cookies.jwt;
    const verifyuser= jwt.verify(token , process.env.SECRET_KEY)
    console.log("user valide ", verifyuser);
    const user= await NewSchema.findOne({_id:verifyuser._id})
    console.log("this is render");
    console.log(user);
    console.log( "user name is",  user.name);
req.token=token;
req.user =user;

    next();
} catch (error) {
 resp.status(401).send(error)   
}
}
module.exports=auth;