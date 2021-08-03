const express=require('express');
const router=express.Router();
const {body,validationResult}=require('express-validator')
const authmw=require('../../middleware/auth-m')

const PostM=require('../../models/PostModel')
const Profile_M=require('../../models/ProfileModel')
const UserM=require('../../models/UserModel')

const mongoose=require('mongoose')

//@route POST api/posts
//private - need to login to create post
router.post('/',[authmw,[body('text','Text is required').not().isEmpty()]],async (req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()})

    try{
        const user=await User.findById(req.user.id).select('-password') //{_id:req.user.id}
        
        const newPost=new PostM({
            text:req.body.text,
            name:user.name,
            avatar:user.avatar,
            user:req.user.id 
        }) //user._id;mongoose.Types.ObjectId(req.user.id)

        const post=await newPost.save()
        
        res.json(post);
    } catch(err){
        console.error(err.message)
        res.status(500).send('Server Error')
    }
    
})


//GET api/posts --- get all posts --- private fe (need to log to communicate) so private here
router.get('/',[authmw],async (req,res)=>{
    try{
        const posts=await PostM.find().sort({date:-1}) //most recent
        res.json(posts)
    }catch(err){
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

//GET api/post/postId --- get a single post by postId --- private fe (need to log to communicate) so private here
router.get('/:postId',[authmw],async (req,res)=>{
    try{
        const post=await PostM.findById(req.params.postId) //mongoose.Types.ObjectId; {_id:xx}

        if(!post) return res.status(404).json({msg:'Post not found'})

        res.json(post)
    }catch(err){
        console.error(err.message)
        
        if(err.kind=='ObjectId') return res.status(404).json({msg:'Post not found'})

        res.status(500).send('Server Error')
    }
})


//delete api/posts/postId --- delete a single post by postId --- private
router.delete('/:postId',[authmw],async (req,res)=>{
    try{
        const post=await PostM.findById(req.params.postId)
        if(!post) return res.status(404).json({msg:'Post not found'})
        
        res.json({msg:'Post removed'})
    }catch(err){
        console.error(err.message)
        
        if(err.kind=='ObjectId') return res.status(404).json({msg:'Post not found'})

        res.status(500).send('Server Error')
    }
})


//like/unlike api/posts/like/postId --- 
//like/unlike a single post by postId --- private
router.put('/like/:postId',[authmw],async (req,res)=>{
    try{
        const post=await PostM.findById(req.params.postId)
        if(!post) return res.status(404).json({msg:'Post not found'})

        const ifLiked=post.likes.filter(like=>like.user.toString()===req.user.id)
        if(ifLiked.length>0){ 
            //1
            //const removeIndex=post.likes.findIndex(like=>like.user==req.user.id) 
            //or const removeIndex=post.likes.indexOf(post.likes.filter(like=>like.user==req.user.id)[0]) 
            //or const removeIndex=post.likes.map(like=>like.user.toString()).indexOf(req.user.id)
            //post.likes.splice(removeIndex,1) //inline 
            //await post.save()
            //res.json(post.likes)
            
            //2
            //post.likes=post.likes.filter(like=>like.user.toString()!==req.user.id)
            //await post.save()
            //res.json(post.likes)
            
           //3
           // const likes=post.likes.filter(like=>like.user!=req.user.id)
            //anw1=await PostM.findByIdAndUpdate(req.params.postId,{likes},{new:true}) 
            //or anw1=await PostM.findByIdAndUpdate({_id:req.params.postId},{$set:{likes}},{new:true})
           //res.json(anw1)
            
           //4
            const likesanw=await PostM.findByIdAndUpdate(req.params.postId,{$pull:{likes:{user:(req.user.id)}}},{new:true})
            res.json(likesanw.likes) //res.json(likesanw)

        }else{ 
            //1
            //post.likes.unshift({user:req.user.id}) 
            //await post.save()
            //res.json(post.likes) 
            
            //2 add to last
            const likesanw=await PostM.findByIdAndUpdate({_id:req.params.postId},{$addToSet:{likes:{user:req.user.id}}},{new:true})
            res.json(likesanw.likes)
        }
        
    }catch(err){
        console.error(err.message)
        
        if(err.kind=='ObjectId') return res.status(404).json({msg:'Post not found'})

        res.status(500).send('Server Error')
    }
})





//@route POST comment api/posts/comment/postId
//private - need to login to comment on A post
router.post('/comment/:postId',[authmw,[body('text','Text is required').not().isEmpty()]],async (req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()})

    try{
        const user=await User.findById(req.user.id).select('-password') 
        const post=await PostM.findById({_id:(req.params.postId)}) 
        
        const newComment={
            text:req.body.text,
            name:user.name,
            avatar:user.avatar,
            user:req.user.id 
        } 

        post.comments.unshift(newComment)
        await post.save()
        res.json(post); 

        //const commentsanw=await PostM.findByIdAndUpdate(req.params.postId,{$addToSet:{comments:newComment}},{new:true})
        //res.json(commentsanw) 

    } catch(err){
        console.error(err.message)
        res.status(500).send('Server Error')
    }
    
})


//@route DELETE comment api/posts/comment/postId/commentId
//private - need to login to delete A comment on A post
router.delete('/comment/:postId/:commentId',[authmw],async (req,res)=>{
    try{
        const post=await PostM.findById(req.params.postId)
        //1
        const commentIndex=post.comments.findIndex(_comment=>_comment.id===req.params.commentId)
        if(commentIndex==-1) return res.status(404).json({msg:"Comment INDEX does not exists"})
        if(post.comments[commentIndex].user.toString()!==req.user.id) return res.status(401).json({msg:"u're not authorised to do so"})

        //post.comments.splice(commentIndex,1)
        //await post.save(); res.json(post.comments)

        //2
        const comment=post.comments.find(_comment=>_comment._id.toString()===req.params.commentId)
        if(!comment)  return res.status(404).json({msg:"Comment does not exists"})
            
        if(comment.user.toString()!==req.user.id) return res.status(401).json({msg:"You're not authorised to do so"})

        //const removeIndex=post.comments.map(_comment=>_comment.id).indexOf(req.params.commentId)
        //const removeIndex=post.comments.map(_comment=>_comment._id.toString()).indexOf(req.params.commentId)
        const removeIndex=post.comments.indexOf(comment)
        //post.comments.splice(removeIndex,1)
        //await post.save(); res.json(post.comments)


        //3
        const comments=post.comments.filter(_comment=>_comment._id.toString()!==req.params.commentId)
        //const c_anw=await PostM.findByIdAndUpdate(req.params.postId,{$set:{comments}},{new:true})
        //const c_anw=await PostM.findByIdAndUpdate({_id:req.params.postId},{comments},{new:true})
        const c_anw=await PostM.findByIdAndUpdate(req.params.postId,{$pull:{comments:comment}},{new:true})
        res.json(c_anw)

    } catch(err){
        console.error(err.message)
        res.status(500).send('Server Error')
    }
    
})

module.exports=router;
