const mongoose = require("mongoose")
const Joi = require("joi")
const OneClass = require("../models/Class")

const teacherSchema = new mongoose.Schema({
    name: String , 
    bio: String ,
    username: String , 
    email: String ,
    password: String ,
    avatar : {
        type: String,
        default: "https://icon-library.com/images/faculty-icon/faculty-icon-17.jpg"
    } ,
    classId:
        {
            type: mongoose.Types.ObjectId,
            ref: "OneClass"
        },
   
})

const teacherJoi = Joi.object({
    name: Joi.string().min(2).max(20).required(),
    bio: Joi.string().min(5).max(200) ,
    username: Joi.string().min(5).max(10).required(),
    email: Joi.string().email().required() ,
    password: Joi.string().min(8).max(50).required(),
    avatar: Joi.string().uri().min(5).max(1000),
    classId: Joi.objectid().required() ,
}) 

const teacherLoginJoi = Joi.object({
    username: Joi.string().min(4).max(15).required(),
    password: Joi.string().min(8).max(50).required()
})
const teacherEditJoi = Joi.object({
    name: Joi.string().min(2).max(20),
    bio: Joi.string().min(5).max(200) ,
    avatar: Joi.string().uri().min(5).max(1000),
})

const Teacher = mongoose.model("Teacher" , teacherSchema)

module.exports.Teacher = Teacher
module.exports.teacherJoi = teacherJoi
module.exports.teacherLoginJoi = teacherLoginJoi
module.exports.teacherEditJoi = teacherEditJoi