const mongoose=require('mongoose')

const ProfileSchema=new mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'userInfo'
    },
    company:{
        type:String
    },
    website:{
        type:String
    },
    location:{
        type:String
    },
    status:{
        type:String,
        required:true
    },
    skills:{
        type:[String],
        required:true
    },
    bio:{
        type:String
    },
    githubusername:{
        type:String
    },
    experience:[
        {
            title:{
                type:String,
                required:true
            },
            company:{
                type:String,
                required:true
            },
            location:{
                type:String //textfield
            },
            from:{
                type:Date,
                required:true
            },
            to:{
                type:Date
            },
            current:{
                type:Boolean,
                default:false //true -> desabled to field; checkbox react
            },
            description:{
                type:String
            }
        }
    ],
    education:[
        {
            school:{
                type:String,
                required:true
            },
            degree:{
                type:String,
                required:true
            },
            major:{
                type:String
            },
            from:{
                type:Date,
                required:true
            },
            to:{
                type:Date
            },
            current:{
                type:Boolean,
                default:false //true -> desabled to field; checkbox react
            },
            description:{
                type:String
            }
        }
    ],
    social:{
        youtube:{
            type:String
        },
        twitter:{
            type:String
        },
        facebook:{
            type:String
        },
        linkedin:{
            type:String
        },
        instagram:{
            type:String
        }
    },
    date:{
        type:Date,
        default:Date.now()
    }
});

module.exports=Profile=mongoose.model('Profile',ProfileSchema); //->profiles