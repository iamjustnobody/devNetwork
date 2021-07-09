const express=require('express');
const router=express.Router();

const {body,validationResult}=require('express-validator');
const gravatar=require('gravatar');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

const User=require('../../models/UserModel')


//@route POST api/users for registeration
router.post('/',
[
    body('name','Name is required').not().isEmpty(),
    body('email','Please include a valid email').isEmail(),
    body('password','Please enter a password with 6 or more characters').isLength({min:6})
],async (req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    console.log(req.body); //user email for registration 

    const {name,email,password}=req.body;
    try{
        //check if user exist
        let user=await User.findOne({email});
        if(user){
            return res.status(400).json({errors:[{errMsg:'User already exist'}]});
        }
    
        //get user gravatar
        const avatar=gravatar.url(email,{
            s:'200',
            r:'pg',
            d:'mm'
        })

        user=new User({username:name,email,avatar,password});
        //encrypt pwd
        const salt=await bcrypt.genSalt(10);
        user.password=await bcrypt.hash(password,salt);

        //console.log(user.id,typeof user.id,user._id,typeof user._id)//string obj
        await user.save();
        //console.log(user.id,typeof user.id,user._id,typeof user._id)//string obj

        //return jwt

        res.send('User registered');

    }catch(err){
        console.error(err.message);
        res.status(500).send("Server error");
    }
})

module.exports=router;