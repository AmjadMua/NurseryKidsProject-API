const mongoose = require("mongoose")
const Joi = require("joi")

const parentSchema = new mongoose.Schema({
    parentFullName : String ,
    username: String ,
    email: String ,
    password: String , 
    kids: [ {
        type: mongoose.Types.ObjectId ,
        ref: "Kid"
    }],  
})

const parentJoi = Joi.object({
    parentFullName: Joi.string().min(4).max(30).required() ,
    username: Joi.string().min(4).max(15).required(),
    email: Joi.string().email().required() ,
    password: Joi.string().min(6).max(100).required(),
    kids: Joi.objectid()
})
const parintLoginJoi = Joi.object({
    username: Joi.string().min(4).max(15).required(),
    password: Joi.string().min(8).max(50).required()
})

const Parent = mongoose.model("Parent" , parentSchema)

module.exports.Parent = Parent 
module.exports.parentJoi = parentJoi
module.exports.parintLoginJoi = parintLoginJoi