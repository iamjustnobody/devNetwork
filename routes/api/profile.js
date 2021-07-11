const express=require('express');
const router=express.Router();

const User=require('../../models/UserModel')
const Profile=require('../../models/ProfileModel')

const {body,validationResult}=require('express-validator');

//@route GET api/profile ---TEST
//router.get('/',(req,res)=>{res.send('profile route');})

const authmw=require('../../middleware/auth-m')

//@route GET api/profiles/me PROTECTED
//GET AUTHORISED USERPROFILE GET MY WON PROFILE GET LOGGEDIN USERPROFILE
//similar to authJS GET
router.get('/me',authmw,async (req,res)=>{
    try{
        const userProfile=await Profile.findOne({userid:req.user.id}).populate('userid',['username','avatar'])
        //profile.findbyid(profileid)
        
        if(!userProfile) return res.status(400).json({noProfExistsMsg:'There is no profile for this user'})

        res.status(200).json(userProfile) //or res.json(userProfile) //return opt
        //return res.status(200).json({userProfile})//return opt 
        //all ok
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})


//@route POST api/profiles PROTECTED
//create/establish or update user profile
//similar to userJS register POST
router.post(
    '/',
    authmw,
    [
        body('status','Status is required').not().isEmpty(),
        body('skills','Skills is required').not().isEmpty()
    ],
    async (req,res)=>{
    //try{
        const errors=validationResult(req);
        if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});
    
        const {company,website,location,bio,status,githubusername,skills,
            youtube,facebook,twitter,instagram,linkedin}=req.body;
        //build profile obj
        const profileFields={};
        profileFields.userid=req.user.id;
        console.log('building profile ',req.user.id, typeof req.user.id, profileFields.userid, typeof profileFields.userid)
        //string string
        if(company) profileFields.company=company;
        if(website) profileFields.website=website;
        if(location) profileFields.location=location;
        if(bio) profileFields.bio=bio;
        if(status) profileFields.status=status;
        if(githubusername) profileFields.githubusername=githubusername;
        if(skills) profileFields.skills=skills.split(',').map(skill=>skill.trim());
        //build profile.social obj
        profileFields.social={}
        if(youtube) profileFields.social.youtube=youtube
        if(twitter) profileFields.social.twitter=twitter
        if(facebook) profileFields.social.facebook=facebook
        if(linkedin) profileFields.social.linkedin=linkedin
        if(instagram) profileFields.social.instagram=instagram

        try{
            let profile=await Profile.findOne({userid:req.user.id})
            if(profile){//UPDATE - amendnp
                profile=await Profile.findOneAndUpdate({userid:req.user.id},{$set:profileFields},{new:true});//ok
               // profile=await Profile.findOneAndUpdate({userid:req.user.id},{profileFields},{new:true}); //ok too
                return res.json(profile) //or return res.status(200).json({profile}) //must have 'return' for res
            }

            //CREATE
            profile=new Profile(profileFields);
            profile.save();
            res.json(profile); //or res.status(200).json({profile}) //both could have 'return' - opt

        }catch(err){
            console.error(err.message);
            res.status(500).send("Server error");
        }

    /*}catch(err){
        console.error(err.message);
        res.status(500).send('Server Error')
    }*/
})



//GET api/profile get all profiles non-protected routes (no authmw)
router.get('/',async(req,res)=>{
    try {
        const profile=await Profile.find().populate('userid',['name','avatar']);
        res.status(200).json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error')
    }
})

//GET api/profile/user/:user_id --- get A profile for a user (based on userId)
//non-protected routes (no authmw)
router.get('/user/:user_id',async(req,res)=>{
    try {
        const profile=await Profile.findOne({userid:req.params.user_id}).populate('userid',['name','avatar']);
        //NOT Profile.findOneById(req.params.user_id).populate

        if(!profile) return res.status(400).json({noProfExistsMsg:'There is no profile for this user'}) 
        //objid of same length but diff digits
        res.status(200).json(profile);

    } catch (error) {
        console.error(error.message);
        if(error.kind=='ObjectId'){
            return res.status(400).json({noProfExistsMsg:'Profile Not Found'}) //objid of diff length
        }
        res.status(500).send('Server Error')
    }
})





//DELETE api/profile --- DELETE authorised/loggedin user profile, user-self, posts
//protected routes (authmw)
//like GET api/profile/me & POST api/profile
router.delete('/',authmw,async(req,res)=>{
    try {
        await Profile.findOneAndRemove({userid:req.user.id});//or findOneAndDelete
        await User.findOneAndRemove({_id:req.user.id}); //_id:ok - did remove; id: did NOT remove 
        //same for findOneAndDelete
        //await User.findByIdAndRemove(req.user.id);//ok
        //await User.findByIdAndDelete(req.user.id);//ok

        res.json({rmMsg:'User removed'});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error')
    }
})




//PUT api/profile/experience --- ADD experience to authorised/loggedin user profile/experience
//protected routes (authmw)
//like GET api/profile/me & POST api/profile & DELETE api/profile
router.put(
    '/experience',
    authmw,
    [
        body('title','Title is required').not().isEmpty(),
        body('company','Company is required').not().isEmpty(),
        body('from','From Date is required').not().isEmpty()
    ],
    async(req,res)=>{
        const errors=validationResult(req);
        if(!errors.isEmpty)return res.status(400).json({errors:errors.array()});

        const {title,company,location,from,to,current,description}=req.body;
        const newExp={title,company,location,from,to,current,description};

    try {

        const profile=await Profile.findOne({userid:req.user.id});
        profile.experience.unshift(newExp);
        await profile.save(); //findAndUpdate

        res.json(profile);//res.json({profile}); return & status opt
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error')
    }
})

//DELETE api/profile/experience/:exp_id --- delete experience to authorised/loggedin user profile/experience
//protected routes (authmw) //could be PUT req
router.delete(
    '/experience/:exp_id',
    authmw,
    async(req,res)=>{
    try {
        const profile=await Profile.findOne({userid:req.user.id});
        //get remove index
        const removeIndex=profile.experience.map(_exp=>_exp._id).indexOf(req.params.exp_id)//ok
        //_exp=>_exp._id or _exp.id both ok

        //const removeIndex=profile.experience.map((_exp,_index)=>{if(_exp._id==req.params.exp_id)return _index})[0] //ok
        //(_exp.id==req.params.exp_id) or (_exp._id==req.params.exp_id) both ok

        profile.experience.splice(removeIndex,1); //ok for these above

       //profile.experience.forEach(_exp=>{if(_exp!=null&&_exp._id!=req.params.exp_id)return _exp}) //foreach not returning
       //nothing changed
       //let profExp=profile.experience
       //profExp.forEach(_exp=>{if(_exp!=null&&_exp._id!=req.params.exp_id)return _exp})
       //console.log('profExp ',profExp); //still nothing changed so cannot save or findandupdate
       //profile.experience=profile.experience.map(_exp=>{if(_exp!=null&&_exp._id!=req.params.exp_id)return _exp}) 
       //null //_exp._id!=req.params.exp_id or _exp.id!=req.params.exp_id -> get result -> null

       //profile.experience.filter(_exp=>_exp!=null) //no changes to profile or profile.experience
       //profile.experience=profile.experience.filter(_exp=>_exp!=null) //ok
       //profile.experience=profile.experience.filter(_exp=>_exp.id!=req.params.exp_id) //ok
       //_exp.id!=req.params.exp_id or _exp._id!=req.params.exp_id both ok

        await profile.save();

      //const profExp=profile.experience.map(_exp=>{if(_exp!=null&&_exp._id!=req.params.exp_id)return _exp})
      /*const profExp=profile.experience.filter(_exp=>_exp.id!=req.params.exp_id) 
      //_exp.id!=req.params.exp_id or _exp._id!=req.params.exp_id are ok
      const newProf=await Profile.findOneAndUpdate(
          {userid:req.user.id},{$set: {"experience": profExp}},{new:true}
          ) //$set for multiple fields updates
        res.json(newProf);*/ //ok

        res.json(profile);//res.json({profile}); return & status opt
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error')
    }
})


router.put(
    '/experience/:exp_id',
    authmw,
    [
        body('title','Title is required').not().isEmpty(),
        body('company','Company is required').not().isEmpty(),
        body('from','From Date is required').not().isEmpty()
    ],
    async(req,res)=>{
        const errors=validationResult(req);
        if(!errors.isEmpty)return res.status(400).json({errors:errors.array()});

        const {title,company,location,from,to,current,description}=req.body;
        const updatedExp={title,company,location,from,to,current,description};

    try {

        const profile=await Profile.findOne({userid:req.user.id});
        /*const updatedProfExp=profile.experience.map(_exp=>{
            if(_exp.id==req.params.exp_id)return updatedExp;
            return _exp;
        })
        const updatedProf=await Profile.findOneAndUpdate({userid:req.user.id},{"experience":updatedProfExp},{new:true})
        res.json(updatedProf);//res.json({updatedProf}); return & status opt
        */ //ok

        profile.experience=profile.experience.map(_exp=>{
            if(_exp.id==req.params.exp_id)return updatedExp;
            return _exp;
        })
        await profile.save(); //findAndUpdate

        res.json(profile);//res.json({profile}); return & status opt
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error')
    }
})

module.exports=router;