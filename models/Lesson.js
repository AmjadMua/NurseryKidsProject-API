const mongoose = require("mongoose")
const Joi = require("joi")

const lessoneSchema = new mongoose.Schema({
    lessonName: String , 
    description: String ,
    photo: String , 
    state: String ,
})

const lessoneJoi = Joi.object({
    lessonName : Joi.string().min(4).max(20).required() ,
    description: Joi.string().max(1000).required(),
    photo: Joi.string().uri().max(1000).required() ,
    state: Joi.string().min(3).max(20)
})

const Lesson = mongoose.model("Lesson" , lessoneSchema)

module.exports.Lesson = Lesson 
module.exports.lessoneJoi = lessoneJoi