const mongoose = require("mongoose")
const Joi = require("joi")

const kidSchema = new mongoose.Schema({
    kidName: String ,
    kidAge: Number ,
    avatar: {
        type: String ,
        default: "https://cdn.pixabay.com/photo/2016/11/18/23/38/child-1837375_960_720.png"
    } ,
    kidclass: {
        type: mongoose.Types.ObjectId,
        ref: "OneClass",
    },
    joinedActivities: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Activity"
        },
    ] ,
    preformence : [{
        type: mongoose.Types.ObjectId ,
        ref: "Preformence"
    }] ,
})

const kidJoi = Joi.object({
    kidName: Joi.string().min(2).max(20).required(),
    kidAge: Joi.number().min(4).max(7).required() ,
    avatar: Joi.string().uri().max(1000),
    kidclass: Joi.objectid() ,
    joinedActivities: Joi.objectid() , 
    preformence : Joi.array().items(Joi.objectid()).min(0).max(100)
})

const Kid = mongoose.model("Kid" , kidSchema)

module.exports.Kid = Kid
module.exports.kidJoi = kidJoi