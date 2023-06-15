const mongoose= require("mongoose");
const bcrypt= require("bcryptjs");
const jwt = require('jsonwebtoken');
const NewSchema= new mongoose.Schema({
    name:String,
    email:String,
    number :Number,
    password :String,
    tokens:[{
token:{
    type:String,
    required:true
}
    }]
})


NewSchema.methods.generateAuthtoken= async function(){
    try {
        console.log(this._id);
        const token= jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
        this.tokens= this.tokens.concat({token:token})
        await this.save()
        return token;
    } catch (error) {
        resp.send("the error part"+error)
       console.log("the error part"+error)
    }
}


NewSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password,10);

    }
    next();
})


module.exports= mongoose.model("products",NewSchema);
