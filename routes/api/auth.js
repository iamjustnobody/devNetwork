const express=require('express');
const router=express.Router();

const authmw=require('../../middleware/auth-m')
const User=require('../../models/UserModel')

const mongoose=require('mongoose')

//@route GET api/auth; GET AUTHORISED USER
//router.get('/',(req,res)=>{res.send('Userauth route');})
router.get('/',authmw,async (req,res)=>{
    try{
        const user=await User.findById(req.user.id).select('-password');
        res.status(200).json(user) 
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})

//@route POST api/auth LOGIN == REGISTER in users.js
const {body,validationResult}=require('express-validator');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const config=require('config')

router.post('/',
[
    body('email','Please include a valid email').isEmail(),
    body('password','Password is required').exists()
],async (req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    const {email,password}=req.body;
    try{
        //check if user exist
        let user=await User.findOne({email});
        if(!user){
            return res.status(400).json({errors:[{errMsg:'Invalid Credentials'}]});
        }
    
        //compare pwd
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch)return res.status(400).json({errors:[{errMsg:'Invalid Credentials'}]});

        //return jwt
        const payload={
            userid:user._id,
            user:{
                id:user.id
            }
        }
        jwt.sign(payload,config.get('jwtSecret'),{expiresIn:3600},(err,token)=>{
            if(err)throw err;
            return res.status(200).json({token}) 
        }) //an hour


    }catch(err){
        console.error(err.message);
        res.status(500).send("Server error");
    }
})

module.exports=router;
