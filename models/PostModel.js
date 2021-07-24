const mongoose=require('mongoose')
const Schema=mongoose.Schema

const PostSchema=new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'userInfo'
    },
    text:{
        type:String,
        required:true
    },
    name:{
        type:String
    },
    avatar:{
        type:String
    },
    likes:[
        {
            user:{
                type:Schema.Types.ObjectId,
                ref:'userInfo'
            }
        }
    ],
    comments:[
        {
            user:{
                type:Schema.Types.ObjectId,
                ref:'userInfo'
            },
            text:{
                type:String,
                required:true
            },
            name:{
                type:String
            },
            avatar:{
                type:String
            },
            date:{
                type:String,
                default:Date.now()
            }
        }
    ]
});

module.exports=Post=mongoose.model('post',PostSchema)