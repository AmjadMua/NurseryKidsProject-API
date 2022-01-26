const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const express = require("express")
const validateBody = require("../middleware/validateBody")
const router = express.Router()
const jwt = require("jsonwebtoken")
const checkId = require("../middleware/checkId")
const checkParent = require("../middleware/checkParent")
const { parintLoginJoi , Parent } = require("../models/Parent")
const { Activity  } = require("../models/Activity")
const { Kid } = require("../models/Kid")
const { Comment , commentJoi } = require("../models/Comment")

// login
router.post("/login" ,validateBody(parintLoginJoi) , async(req , res) => {
    try {
        const { username , password } = req.body
         const parent = await Parent.findOne({username})
         if(!parent) return res.status(404).send("parent not found!")

         const valid = await bcrypt.compare(password , parent.password)
         if(!valid) return res.status(400).send("Incorrect password")

         const token = jwt.sign({id: parent._id} , process.env.JWT_SECRET_KEY , {expiresIn : "20d"})
         res.send(token)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// get profile 
router.get("/profile" , checkParent , async (req , res) => {
    try {
      const parent = await Parent.findById(req.parentId).select("-__v").populate({
          path: "kids" , 
          select: "-__v",
          populate:[{path:"preformence" , populate:"classId lessonId kidId"}, "joinedActivities",
           {path:"kidclass",populate:"lessons" }]
      })
      res.json(parent)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// get kid profile
router.get("/:kidId/profile" , checkParent , async (req ,res) => {
    try {
        const kid = await Kid.findById(req.params.kidId).select(" -__v").populate({
            path: "kidclass" , 
            select: "-__v -classMembers"
        }).populate("joinedActivities").populate("preformence")
        if(!kid) return res.status(404).send("Not found!")

        res.json(kid)
    } catch (error) {
        res.status(500).send(error.message)
    }
})
// get all activites 
router.get("/kids/activities" , async (req , res) => {
    try {
        const activites = await Activity.find().select("-__v").populate([
            "teamMembers"
        , {path:"comments" ,
    populate:"parentId"} ])
        res.json(activites)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// registere kid into an activity
router.post("/kids/activities/join/:activityId/:kidId" , checkParent, async (req , res) => {
    try {
        const activity = await Activity.findById(req.params.activityId)
        if(!activity) return res.status(404).send("the activity does not exist!")

       const kid = await Parent.findOne({kids: req.params.kidId}) 
       if(!kid) return res.status(404).send(`The kid with ${kid} id not found!`)

       const kidregisted = activity.teamMembers.find(onekid=> onekid._id == kid)
       if(kidregisted) return res.status(400).send("Your kids allready registed!")

       await Kid.findByIdAndUpdate(req.params.kidId , {$push: {joinedActivities: req.params.activityId }})
       await Activity.findByIdAndUpdate(req.params.activityId , {$push: {teamMembers: req.params.kidId}})

       res.send("Joined successfully")

    } catch (error) {
        res.status(500).send(error.message)
    }
} )

// get one activity
router.get("/kids/activities/:id" , checkId , checkParent , async (req , res) => {
    try {
        const activity = await Activity.findById(req.params.id).populate({
            path:"comments",
            populate:{
                path:"parentId"
            }
        })
        if(!activity) return res.status(404).send("the activity not found")
        
        res.json(activity)
    } catch (error) {
        res.status(500).send(error.message)
    }
}) 

// add comment to an activity
router.post("/kids/activities/:id/comments" , checkParent , checkId , validateBody(commentJoi) , async(req , res) => {
    try {
        const {comment} = req.body

        const newComment = new Comment({
            parentId: req.parentId,
            comment : comment
        })
        await Activity.findByIdAndUpdate(req.params.id , {$push: {comments: newComment}})
        await newComment.save()
   
        res.json(newComment)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// edit comment 
router.put("/kids/activities/:id/comments/:commentId" , checkId , checkParent , validateBody(commentJoi) , async (req , res) => {
    try {
        const activity = await Activity.findById(req.params.id)
        if(!activity) return res.status(404).send("Thr activity not found!")
        const commentFound = await Comment.findById(req.params.commentId)
        if(!commentFound) return res.status("the comment not found!")

        const parent = await Parent.findById(req.parentId)
        if(commentFound.parentId != parent.id) return res.status(403).send("unauthorized action")
        const { comment } = req.body

        const commentUpdated = await Comment.findByIdAndUpdate(req.params.commentId , {$set : {comment}} , {new: true})

        res.json(commentUpdated)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// delete comment
router.delete("/kids/activities/:id/comments/:commentId" , checkId, checkParent , async (req , res ) => {
    try {
        const activity = await Activity.findById(req.params.id)
        if(!activity) return res.status(404).send("The Activity not found!")

        const commentFound = await Comment.findById(req.params.commentId)
        if(!commentFound) return res.status(404).send("Comment not found!")

        const parent = await Parent.findById(req.parentId)
        if(commentFound.parentId != parent.id ) return res.status(403).send("unauthorized action")

        await Activity.findByIdAndUpdate(req.params.id , {$pull : {comments: commentFound._id}})
        await Comment.findByIdAndRemove(req.params.commentId)
        res.send("the comment removed!")
    } catch (error) {
        res.status(500).send(error.message)
    }
} )


module.exports = router