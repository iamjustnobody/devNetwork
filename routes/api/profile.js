const express=require('express');
const router=express.Router();

//@route GET api/profiles
router.get('/',(req,res)=>{
    res.send('profile route');
})

module.exports=router;