const mongoose = require("mongoose")
const Joi = require("joi")

const preformenceSchema = mongoose.Schema({
        kidId : {
            type: mongoose.Types.ObjectId,
            ref: "Kid"
        } , 
        classId: {
            type: mongoose.Types.ObjectId ,
            ref: "OneClass"
        },
        lessonId: {
            type: mongoose.Types.ObjectId ,
            ref: "Lesson"
        },
        score: Number ,
        note: String
})

const preformenceJoi = Joi.object({
    kidId: Joi.objectid(),
    classId: Joi.objectid() ,
    lessonId: Joi.objectid(),
    score: Joi.number().max(100).required(),
    note: Joi.string().max(1000)
})

const Preformence = mongoose.model("Preformence" , preformenceSchema)

module.exports.Preformence = Preformence 
module.exports.preformenceJoi = preformenceJoi 