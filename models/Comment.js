const mongoose = require("mongoose")
const Joi = require("joi")

const commentSchema = new mongoose.Schema({
    parentId: {
        type: mongoose.Types.ObjectId,
        ref: "Parent"
    },
    comment: String
})

const commentJoi = Joi.object({
    comment: Joi.string().min(4).max(1000).required()
})

const Comment = mongoose.model("Comment" , commentSchema)

module.exports.commentJoi = commentJoi
module.exports.Comment = Comment