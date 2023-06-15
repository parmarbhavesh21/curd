require('dotenv').config();
const express= require('express');
const app= express();
const port = process.env.PORT || 5000;
const bcrypt= require('bcryptjs');
const jwt =require('jsonwebtoken');
const bodyparser= require("body-parser");
const auth= require('./middleware/auth')
const cookieparser= require('cookie-parser');

const mongoose= require("mongoose");

mongoose.connect("mongodb://localhost:27017/Myweb",{
   useNewUrlparser:true,
   useUnifiedTopology:true
   
}).then(()=>{
   console.log("connect mongoose");
}).catch((err)=>{
   console.log(err);
})

const NewSchema= require("./models/moschema");


app.use(express.static("public"))
app.set('view engine','ejs')
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
// app.use(cookieparser)
 app.use(cookieparser())

console.log( "SECRET KEY NAME=>>>>>",process.env.SECRET_KEY);
 app.get("/",(req,resp)=>{
    resp.render("index.ejs")

 })
 app.get("/home",(req,resp)=>{
   resp.render("index.ejs")

})
 app.get("/about",auth, (req,resp)=>{
    resp.render("about.ejs")
 })
 app.get("/serviece",(req,resp)=>{
   resp.render("services.ejs")
})
app.get("/register",(req,resp)=>{
   resp.render("register.ejs")
})
app.post("/register",async (req,resp)=>{
   let data= new NewSchema({
      name:req.body.name,
      email:req.body.email,
     number:req.body.number,
      password:req.body.password

   })
   const token= await data.generateAuthtoken();
   // resp.cookie("jwt",token);
   // console.log("To part cooki and token", "jwt" ,token);
   // resp.cookie("jwttt",token)
   // console.log(cookie);
   resp.cookie("jwt",token,{
      expires:new Date(Date.now()+500000),
      httpOnly:true
   });
   await data.save();
   console.log("data see -<<<", data );
  
   
   

   resp.render("index.ejs")
})



app.get("/login",(req,resp)=>{
   resp.render("login.ejs")
})

app.post("/login",async(req,resp)=>{
   const name= req.body.name;
   const email= req.body.email;
   const password= req.body.password;
   const userinfo= await NewSchema.findOne({email:req.body.email})
   const ismatch= await bcrypt.compare(password,userinfo.password)
   const token= await userinfo.generateAuthtoken();
console.log("token part in register ma token se te login ma se ===" ,token);
  
   console.log("Bcrypt password  match" ,ismatch);

   resp.cookie("jwt",token,{
      expires:new Date(Date.now()+500000),
      httpOnly:true
   });
   
console.log( `this is the cookie awesome  =>> ${req.cookies.jwt}`);
      
  if(ismatch){
resp.status(201).render("index.ejs")
  }else{
   resp.status(500).send("Enter is valid Input")
  }
})

app.get("/logout",(req,resp)=>{
   resp.render("index.ejs")
})
app.get("/display",async(req,resp)=>{
  NewSchema.find({})
   .then((result)=>{
      resp.render("display.ejs",{details:result});
   }).catch((err)=>{
      resp.status(500).send(err);
   })
})

app.get("/delete/:id",async(req,resp)=>{
   await NewSchema.findByIdAndDelete(req.params.id)
   resp.redirect("/display")
})

app.get("/update/:id", async(req,resp)=>{
   await NewSchema.findById(req.params.id)
   .then((result)=>{
 
      resp.render("update.ejs",{details:result})
   }).catch((err)=>{
      resp.status(500).send("Invalid Input")
   })
})

app.post("/update/:id",async(req,resp)=>{
   let data= await NewSchema.findById(req.params.id)
   if(data && data.password !== req.body.password){
      req.body.password=await bcrypt.hash(req.body.password,10)
   }
   await NewSchema.findByIdAndUpdate(req.params.id,req.body)
  resp.redirect("/display")
})


 app.listen(port,()=>{
    console.log(`http://localhost:${port}`);
 })