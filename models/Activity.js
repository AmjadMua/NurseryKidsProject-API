const mongoose = require("mongoose")
const Joi = require("joi")


const activitySchema = new mongoose.Schema({
    activityName: String ,
    description: String,
    teamMembers: [
        {
            type: mongoose.Types.ObjectId ,
            ref: "Kid"
        },
    ],
    date: Date ,
    photos: [
            String,
    ] ,
    comments :[{
        type: mongoose.Types.ObjectId,
        ref: "Comment"
    }] ,
})


const activityJoi = Joi.object({
    activityName: Joi.string().min(4).max(100).required(),
    description : Joi.string().min(10).max(1000).required(),
    teamMembers: Joi.objectid() ,
    date: Joi.date().required(),
    photos: Joi.string(),
    comments:Joi.objectid()

})
const editActivityJoi = Joi.object({
    activityName: Joi.string().min(4).max(100),
    description : Joi.string().min(10).max(1000),
    date: Joi.date(),
    photos: Joi.string(),

})


const Activity = mongoose.model("Activity" , activitySchema)

module.exports.Activity = Activity
module.exports.activityJoi = activityJoi
module.exports.editActivityJoi = editActivityJoi
