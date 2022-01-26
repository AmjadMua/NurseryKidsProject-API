const mongoose = require("mongoose")
const Joi = require("joi")

const classSchema = new mongoose.Schema({
    nameOfClass: String ,
    teacher: {
        type: mongoose.Types.ObjectId,
        ref: "Teacher"
    } ,
    lessons : [ {
        type: mongoose.Types.ObjectId,
        ref: "Lesson"
    }],
    classMembers: [ {
            type: mongoose.Types.ObjectId,
            ref: "Kid"
        }] ,
    
})

const classJoi = Joi.object({
    nameOfClass: Joi.string().max(20).required() , 
    teacher: Joi.objectid(),
    lessons: Joi.objectid(),
    classMembers: Joi.objectid()
})


const OneClass = mongoose.model("OneClass" , classSchema)

module.exports.OneClass = OneClass
module.exports.classJoi = classJoi