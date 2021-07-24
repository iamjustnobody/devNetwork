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
        console.log(typeof req.user.id)//string no matter whether its user.id or user._id in auth.js or users.js
        const user=await User.findById(req.user.id).select('-password') //ok
        //const user=await User.findById({id:req.user.id}).select('-password') //type obj
        //server error; cast to objId failed; path _id for model userInfo //NOT ok
        //const user=await User.findById({_id:req.user.id}).select('-password') //ok
        //const user=await User.findById(mongoose.Types.ObjectId(req.user.id)).select('-password') //ok
        //const user=await User.findById({id:mongoose.Types.ObjectId(req.user.id)}).select('-password') //NOT ok
        //const user=await User.findById({_id:mongoose.Types.ObjectId(req.user.id)}).select('-password') //ok
        
        const newPost=new PostM({
            text:req.body.text,
            name:user.name,
            avatar:user.avatar,
            user:req.user.id 
            //user:user.id 
            //user:user._id
            //user:mongoose.Types.ObjectId(req.user.id)
        }) //all works 

        console.log(req.userid,"000") //undefined no matter whether its user.id or user._id in auth.js or users.js

        const post=await newPost.save()
        
        //res.send('posts route');
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
        const post=await PostM.findById(req.params.postId) //ok
        //const post=await PostM.findById({id:req.params.postId}) //not ok
        //const post=await PostM.findById({_id:req.params.postId})//ok
        //const post=await PostM.findById({id:mongoose.Types.ObjectId(req.params.postId)})//not ok
        //const post=await PostM.findById({_id:mongoose.Types.ObjectId(req.params.postId)})//ok

        if(!post) return res.status(404).json({msg:'Post not found'})

        res.json(post)
        //res.json({post:post}) res.json({post})
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

        console.log(typeof post.id,typeof post._id,typeof post.user.id,typeof post.user._id)
        console.log(typeof post.user,typeof req.user.id, typeof req.userid)

        
        
        res.json({msg:'Post removed'})
        //res.json({post:post}) res.json({post}) res.json(post)
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

        //console.log(typeof post.id,typeof post._id,typeof post.user.id,typeof post.user._id)
        //string obj obj obj
        //console.log(typeof post.user,typeof req.user.id, typeof req.userid)
        //obj string undefined
        //console.log(post.user,post.user.id,post.user._id) //objId <Buffer60 ea 77> objId
        //console.log(post.id,post._id,req.user.id) //6615f 6615f 66668 allobjid
        console.log(req.user.id,typeof req.user.id, mongoose.Types.ObjectId(req.user.id), typeof mongoose.Types.ObjectId(req.user.id))
        //6677 string 6677 obj
        console.log(post.likes[0].user,typeof post.likes[0].user) //6677 obj

        //the following ifLiked - only those marked w ok*2 work

        //const ifLiked=post.likes.includes(mongoose.Types.ObjectId(req.user.id))//T or F 
        //const ifLiked=post.likes.includes(req.user.id)
        //const ifLiked=post.likes.includes({user:mongoose.Types.ObjectId(req.user.id)})//T or F 
        //const ifLiked=post.likes.includes({user:req.user.id})
        //if(ifLiked){return res.json({ifLiked})}//above not right

        //const ifLiked=post.likes.find(like=>like.user===mongoose.Types.ObjectId(req.user.id)) //undefined
        //const ifLiked=post.likes.find(like=>like.user==mongoose.Types.ObjectId(req.user.id))
        //const ifLiked=post.likes.find(like=>like.user===(req.user.id))
        //const ifLiked=post.likes.find(like=>like.user==(req.user.id))//okok
        //const ifLiked=post.likes.find(like=>like.user.toString()===(req.user.id)) //okok
        //const ifLiked=post.likes.find(like=>like.user.toString()==(req.user.id))//okok
        //const ifLiked=post.likes.find(like=>like==={user:mongoose.Types.ObjectId(req.user.id)}) //undefined
        //like=={user:mongoose.Types.ObjectId(req.user.id)} or like=={user:req.user.id} or like==={user:req.user.id}
        
       // const ifLiked=post.likes.indexOf(like=>like.user===mongoose.Types.ObjectId(req.user.id)) //-1 

        //const ifLiked=post.likes.findIndex(like=>like.user===mongoose.Types.ObjectId(req.user.id))//-1 
        //const ifLiked=post.likes.findIndex(like=>like.user==mongoose.Types.ObjectId(req.user.id)) 
        //const ifLiked=post.likes.findIndex(like=>like.user==req.user.id) //0 ok ok
        //const ifLiked=post.likes.findIndex(like=>like.user===req.user.id)
        //const ifLiked=post.likes.findIndex(like=>like.user.toString()==req.user.id) //0 okok
        //const ifLiked=post.likes.findIndex(like=>like.user.toString()===req.user.id)//0 okok
        // const ifLiked=post.likes.findIndex(like=>like=={user:req.user.id}) //-1
        //const ifLiked=post.likes.findIndex(like=>like==={user:req.user.id})
        //const ifLiked=post.likes.findIndex(like=>like=={user:mongoose.Types.ObjectId(req.user.id)}) 
        //const ifLiked=post.likes.findIndex(like=>like==={user:mongoose.Types.ObjectId(req.user.id)})

        //const ifLiked=post.likes.filter(like=>like.user==mongoose.Types.ObjectId(req.user.id)) 
        //const ifLiked=post.likes.filter(like=>like.user===mongoose.Types.ObjectId(req.user.id))
        //above two length>0 or ==0 []
        //const ifLiked=post.likes.filter(like=>like.user==req.user.id) //ok ok
        //const ifLiked=post.likes.filter(like=>like.user===req.user.id)//[] 
        //const ifLiked=post.likes.filter(like=>like.user.toString()===req.user.id)//ok ok
        const ifLiked=post.likes.filter(like=>like.user.toString()==req.user.id) //ok ok
        //const ifLiked=post.likes.filter(like=>like=={user:mongoose.Types.ObjectId(req.user.id)}) //[]
        //like==={user:mongoose.Types.ObjectId(req.user.id)} or like=={user:req.user.id}/like==={user:req.user.id}

        console.log('ifliked',ifLiked)

        let anw;let anw1;
        //if(ifLiked){
        //if(ifLiked>=0){
        if(ifLiked.length>0){ //if(ifLiked>=0){ //if(ifLiked){
            //the following methods all work unless otherwise stating 'not removed'

            //const removeIndex=post.likes.findIndex(like=>like.user==req.user.id) //can be combined with ifliked findIndex
            //const removeIndex=post.likes.indexOf(post.likes.filter(like=>like.user==req.user.id)[0]) //indexof({user:objid})
            //see ifliked above for vairation of filter & findIndex
            //const removeIndex=post.likes.map(like=>like.user).indexOf(req.user.id)
            //const removeIndex=post.likes.map(like=>like.user.toString()).indexOf(req.user.id)
            //const removeIndex=post.likes.map(like=>like.user).indexOf(mongoose.Types.ObjectId(req.user.id))
            //post.likes.splice(removeIndex,1) //inline ops on post.likes array
            //console.log('removedindex ',removeIndex,post.likes) //[{_id:xxx,user:fff}]
            //await post.save()
            //res.json(post.likes)
            /*
            let likes=post.likes
            likes=post.likes.filter(like=>like.user!=req.user.id) //see ifliked filter variation
            console.log('unlike ',likes,post.likes) //these two not changed together
            //await post.save() //post.likes unchanged by filter 
            //res.json(post.likes) //or res.json(likes) but differernt o/p
            anw1=await PostM.findByIdAndUpdate(req.params.postId,{likes},{new:true}) 
            //anw1=await PostM.findByIdAndUpdate({_id:req.params.postId},{$set:{likes}},{new:true})
            //findbyidnupdate variation below
            res.json(anw1)
            */
            /*
            //post.likes=post.likes.filter(like=>like.user!=req.user.id)
            //post.likes=post.likes.filter(like=>like.user!==req.user.id)//not removed!
            //post.likes=post.likes.filter(like=>like.user.toString()!=req.user.id)
            //post.likes=post.likes.filter(like=>like.user.toString()!==req.user.id)
            //post.likes=post.likes.filter(like=>like.user!=mongoose.Types.ObjectId(req.user.id))//not removed although both obj see below
            post.likes=post.likes.filter(like=>{console.log('f1 ',like.user,typeof like.user)
            console.log('f2 ',mongoose.Types.ObjectId(req.user.id),typeof mongoose.Types.ObjectId(req.user.id))
            return like.user!=mongoose.Types.ObjectId(req.user.id)}) //not removed although both obj
            //see above 'ifliked' for filter variation //can be combined with ifLiked filter --- see delete comment below
            await post.save()
            res.json(post.likes)
            */
           /*
            const likes=post.likes.filter(like=>like.user!=req.user.id)
            //anw1=await PostM.findByIdAndUpdate(req.params.postId,{likes},{new:true}) 
            anw1=await PostM.findByIdAndUpdate({_id:req.params.postId},{$set:{likes}},{new:true})
            //findbyidnupdate variation below
            res.json(anw1)
            */
           
            const likesanw=await PostM.findByIdAndUpdate(req.params.postId,{$pull:{likes:{user:(req.user.id)}}},{new:true})
            //see likesanw variations below
            res.json(likesanw)

        }else{ console.log('ifliked',ifLiked) //following methods all work 
            //1
            const likes=post.likes
            //likes.push({user:req.user.id}) //ok insert at the lastof the array
            //likes.unshift({user:mongoose.Types.ObjectId(req.user.id)}) //ok
            //likes.unshift({user:req.user.id}) //ok //insert to the first
            likes.push({user:mongoose.Types.ObjectId(req.user.id)})//ok
            console.log('likes ',post.likes,likes)
            //anw=await PostM.findByIdAndUpdate({_id:req.params.postId},{likes:likes},{new:true})//ok
            //anw=await PostM.findByIdAndUpdate(req.params.postId,{$set:{likes}},{new:true})//ok
            anw=await PostM.findByIdAndUpdate(req.params.postId,{$set:{likes:likes}},{new:true})//ok
            //anw=await PostM.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.postId),{likes},{new:true}) //ok
            console.log('likes o/p: ',likes,post.likes,anw) //likes & post.likes change together
            ///likes:[{_id:60ff00,user:60easd8877},{_id:xxx,user:yyy}]
            ///anw {_id:xxx,text:'ddd',avatar:'dwdffw',user:79989f3,likes:[see above],comments:[],__v:0}
            res.json(anw)
            //res.json(likes) // or res.json({likes})/res.json({likes:likes}) 
            //res.json(post.likes) //or res.json({likes:post.likes})
            //likes & post.likes already inline changed
            //1b 2a
            //const likes=post.likes
            //likes.unshift({user:req.user.id})
            //console.log('likes ',post.likes,likes) //push & unshift - inline change; these two changed together
            //await post.save() //inline change already so no need to findnupdate like above method 1
            //res.json(likes) //res.json(post.likes)

            //2
            //post.likes.push({user:req.user.id}) //ok not add dup if exists already
            //post.likes.unshift({user:mongoose.Types.ObjectId(req.user.id)})
            //post.likes.unshift({user:req.user.id}) 
            //post.likes.push({user:mongoose.Types.ObjectId(req.user.id)})
            //await post.save()
            //res.json(post.likes) //res.json(post)/res.json({post})/res.json({post:post}) just like 'anw' above

            //3 add to last
            //const likesanw=await PostM.findByIdAndUpdate(req.params.postId,{$addToSet:{likes:{user:mongoose.Types.ObjectId(req.user.id)}}},{new:true})
            //const likesanw=await PostM.findByIdAndUpdate({_id:req.params.postId},{$addToSet:{likes:{user:req.user.id}}},{new:true})
            //const likesanw=await PostM.findByIdAndUpdate(req.params.postId,{$push:{likes:{user:mongoose.Types.ObjectId(req.user.id)}}},{new:true})
            //const likesanw=await PostM.findByIdAndUpdate({_id:req.params.postId},{$push:{likes:{user:req.user.id}}},{new:true})
            //res.json(likesanw) //res.json({likesanw}) res.json({likes:likesanw}) //jus like 'anw' above
        }
        
        //res.json(post.likes)
        //res.json({likes:post.likes}) res.json({post:{likes:post.likes}}) 
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
        console.log(typeof req.user.id)//string no matter whether its user.id or user._id in auth.js or users.js
        console.log(typeof req.params.postId)//string
        const user=await User.findById(req.user.id).select('-password') //ok
        //const post=await PostM.findById({_id:mongoose.Types.ObjectId(req.params.postId)}) //not id
        const post=await PostM.findById({_id:(req.params.postId)}) //not id
        //const post=await PostM.findById(req.params.postId)
        
        const newComment={
            text:req.body.text,
            name:user.name,
            avatar:user.avatar,
            user:req.user.id 
            //user:user.id 
            //user:user._id
            //user:mongoose.Types.ObjectId(req.user.id)
        } //all works 

        post.comments.unshift(newComment)
        await post.save()
        res.json(post); //or  only send back to frontend res.json(post.comments)
        //added to the start

        //const commentsanw=await PostM.findByIdAndUpdate(req.params.postId,{$addToSet:{comments:newComment}},{new:true})
        //res.json(commentsanw) //res.json({comments:commentsanw})
        //added to the end; see likesanw variations above

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
        //post.comments=post.comments.filter(_comment=>_comment.id.toString()!=req.params.commentId)
        //post.comments=post.comments.filter(_comment=>_comment._id.toString()!=req.params.commentId)
        //post.comments=post.comments.filter(_comment=>_comment.id.toString()!==req.params.commentId)
        //post.comments=post.comments.filter(_comment=>_comment._id.toString()!==req.params.commentId)
        //post.comments=post.comments.filter(_comment=>_comment.id!=req.params.commentId)
        //post.comments=post.comments.filter(_comment=>_comment.id!==req.params.commentId)
        //post.comments=post.comments.filter(_comment=>_comment._id!=req.params.commentId)
        //post.comments=post.comments.filter(_comment=>_comment._id!==req.params.commentId) //not removed
        //post.comments=post.comments.filter(_comment=>_comment.id!=mongoose.Types.ObjectId(req.params.commentId))
        //post.comments=post.comments.filter(_comment=>_comment.id!==mongoose.Types.ObjectId(req.params.commentId)) //not removed
        //post.comments=post.comments.filter(_comment=>_comment._id!=mongoose.Types.ObjectId(req.params.commentId)) //not removed
        //post.comments=post.comments.filter(_comment=>_comment._id!==mongoose.Types.ObjectId(req.params.commentId))//not removed
        //await post.save()
        //res.json(post.comments) 
        //res.json(post)
        

        //2
        const commentIndex=post.comments.findIndex(_comment=>_comment.id===req.params.commentId)
        //const commentIndex=post.comments.findIndex(_comment=>_comment.id==req.params.commentId)
        //const commentIndex=post.comments.findIndex(_comment=>_comment._id===req.params.commentId) //-1 not found
        //const commentIndex=post.comments.findIndex(_comment=>_comment._id==req.params.commentId)
        //const commentIndex=post.comments.findIndex(_comment=>_comment.id.toString()===req.params.commentId)
        //const commentIndex=post.comments.findIndex(_comment=>_comment.id.toString()==req.params.commentId)
        //const commentIndex=post.comments.findIndex(_comment=>_comment._id.toString()===req.params.commentId)
        //const commentIndex=post.comments.findIndex(_comment=>_comment._id.toString()==req.params.commentId)
        //const commentIndex=post.comments.findIndex(_comment=>_comment.id==mongoose.Types.ObjectId(req.params.commentId))
        //const commentIndex=post.comments.findIndex(_comment=>_comment.id===mongoose.Types.ObjectId(req.params.commentId))//-1 not found
        //const commentIndex=post.comments.findIndex(_comment=>_comment._id==mongoose.Types.ObjectId(req.params.commentId)) //-1 not found
        //const commentIndex=post.comments.findIndex(_comment=>_comment._id===mongoose.Types.ObjectId(req.params.commentId))//-1 not found
        console.log('commentIndex ',commentIndex)
        ///if(commentIndex!=-1)return res.json({msg:'found it',index:commentIndex}) 
        if(commentIndex==-1) return res.status(404).json({msg:"Comment INDEX does not exists"})
        //if(post.comments[commentIndex].user!=req.user.id) return res.status(401).json({msg:"u're not authorised to do so"})
        //if(post.comments[commentIndex].user!==req.user.id) return res.status(401).json({msg:"u're not authorised to do so"})
        //if(post.comments[commentIndex].user==req.user.id) return res.status(401).json({msg:"u're authorised to do so"})
        //if(post.comments[commentIndex].user===req.user.id) return res.status(401).json({msg:"u're authorised to do so"}) //BUT NOT authorised
        //if(post.comments[commentIndex].user.toString()!=req.user.id) return res.status(401).json({msg:"u're not authorised to do so"})
        //if(post.comments[commentIndex].user.toString()!==req.user.id) return res.status(401).json({msg:"u're not authorised to do so"})
        //if(post.comments[commentIndex].user.toString()==req.user.id) return res.status(401).json({msg:"u're authorised to do so"})
        //if(post.comments[commentIndex].user.toString()===req.user.id) return res.status(401).json({msg:"u're authorised to do so"})
        //if(post.comments[commentIndex].user!=mongoose.Types.ObjectId(req.user.id)) return res.status(401).json({msg:"u're not authorised to do so"})
        //if(post.comments[commentIndex].user!==mongoose.Types.ObjectId(req.user.id)) return res.status(401).json({msg:"u're not authorised to do so"})
        //if(post.comments[commentIndex].user==mongoose.Types.ObjectId(req.user.id)) return res.status(401).json({msg:"u're authorised to do so"}) //BUT NOT AUTH
        //if(post.comments[commentIndex].user===mongoose.Types.ObjectId(req.user.id)) return res.status(401).json({msg:"u're authorised to do so"})//BUT NOT AUTH

        //post.comments.splice(commentIndex,1)
        //await post.save()
        //res.json(post.comments)
        //res.json(post)


        //3
        const comment=post.comments.find(_comment=>{//console.log(_comment.id,typeof _comment.id)//6679d string
            //console.log(_comment._id,typeof _comment._id,req.params.commentId,typeof req.params.commentId)
            //6679d obj string77dc73
            return _comment.id===req.params.commentId})
        //const comment=post.comments.find(_comment=>_comment.id==req.params.commentId)
        //const comment=post.comments.find(_comment=>_comment._id===req.params.commentId) //-1 not found
        //const comment=post.comments.find(_comment=>_comment._id==req.params.commentId)
        //const comment=post.comments.find(_comment=>_comment.id.toString()===req.params.commentId)
        //const comment=post.comments.find(_comment=>_comment.id.toString()==req.params.commentId)
        //const comment=post.comments.find(_comment=>_comment._id.toString()===req.params.commentId)
        //const comment=post.comments.find(_comment=>_comment._id.toString()==req.params.commentId)
        //const comment=post.comments.find(_comment=>_comment.id==mongoose.Types.ObjectId(req.params.commentId))
        //const comment=post.comments.find(_comment=>_comment.id===mongoose.Types.ObjectId(req.params.commentId))//-1 not found
        //const comment=post.comments.find(_comment=>_comment._id==mongoose.Types.ObjectId(req.params.commentId)) //-1 not found
        //const comment=post.comments.find(_comment=>_comment._id===mongoose.Types.ObjectId(req.params.commentId))//-1 not found
        //find->filter[0] opposite (non-equality) to filter above (equality)
        //if(comment) return res.json({msg:'found it!'}) 
        if(!comment)  return res.status(404).json({msg:"Comment does not exists"})
            
        if(comment.user.toString()!==req.user.id) return res.status(401).json({msg:"You're not authorised to do so"})
        //if(comment.user.toString()!=req.user.id) return res.status(401).json({msg:"You're not authorised to do so"})
        //if(comment.user!==req.user.id) return res.status(401).json({msg:"You're not authorised to do so"})
        //if(comment.user!=req.user.id) return res.status(401).json({msg:"You're not authorised to do so"})
        //if(comment.user!==mongoose.Types.ObjectId(req.user.id)) return res.status(401).json({msg:"You're not authorised to do so"})
        //if(comment.user!=mongoose.Types.ObjectId(req.user.id)) return res.status(401).json({msg:"You're not authorised to do so"})
        
        //if(comment.user.toString()===req.user.id) return res.status(401).json({msg:"You're authorised to do so"})
        //(comment.user.toString()==req.user.id) return res.status(401).json({msg:"You're authorised to do so"})
        //if(comment.user===req.user.id) return res.status(401).json({msg:"You're authorised to do so"}) //but not authorised
        //if(comment.user==req.user.id) return res.status(401).json({msg:"You're authorised to do so"})
        //if(comment.user===mongoose.Types.ObjectId(req.user.id)) return res.status(401).json({msg:"You're authorised to do so"})//but not authorised
        //if(comment.user==mongoose.Types.ObjectId(req.user.id)) return res.status(401).json({msg:"You're authorised to do so"})//but not authorised
        
        //const removeIndex=post.comments.map(_comment=>_comment.id).indexOf(req.params.commentId)
        //const removeIndex=post.comments.map(_comment=>_comment.id.toString()).indexOf(req.params.commentId)
        //const removeIndex=post.comments.map(_comment=>_comment.id).indexOf(mongoose.Types.ObjectId(req.params.commentId))
        //const removeIndex=post.comments.map(_comment=>_comment._id).indexOf(req.params.commentId)
        //const removeIndex=post.comments.map(_comment=>_comment._id.toString()).indexOf(req.params.commentId)
        //const removeIndex=post.comments.map(_comment=>_comment._id).indexOf(mongoose.Types.ObjectId(req.params.commentId))
        const removeIndex=post.comments.indexOf(comment)
        console.log('removeIndex ',removeIndex)
        //post.comments.splice(removeIndex,1)
        //await post.save()
        //res.json(post.comments)
        //res.json(post)

        //res.json({msg:'why'})
        //4
        const comments=post.comments.filter(_comment=>_comment._id.toString()!==req.params.commentId)
        //const c_anw=await PostM.findByIdAndUpdate(req.params.postId,{$set:{comments}},{new:true})
        //const c_anw=await PostM.findByIdAndUpdate({_id:req.params.postId},{comments},{new:true})
        const c_anw=await PostM.findByIdAndUpdate(req.params.postId,{$pull:{comments:comment}},{new:true})
        res.json(c_anw)
        //res.json(post.comments)  //res.json(post)

    } catch(err){
        console.error(err.message)
        res.status(500).send('Server Error')
    }
    
})

module.exports=router;