const express = require("express")
const { Teacher , teacherJoi , teacherLoginJoi , teacherEditJoi} = require("../models/Teacher")
const router = express.Router()
const bcrypt = require("bcrypt")
const validateBody = require("../middleware/validateBody")
const jwt = require("jsonwebtoken")
const checkTeacher = require("../middleware/checkTeacher")
const { OneClass } = require("../models/Class")
const { Lesson, lessoneJoi } = require("../models/Lesson")
const checkId = require("../middleware/checkId")
const { Preformence , preformenceJoi } = require("../models/Preformence")
const { Kid } = require("../models/Kid")

// login 
router.post("/login" , validateBody(teacherLoginJoi) , async(req , res) => {
    try {
        const {username , password} = req.body

        const teacher = await Teacher.findOne({username})
        if(!teacher) return res.status(404).send("The teacher not found")

        const valid = await bcrypt.compare(password , teacher.password)
        if(!valid) return res.status(400).send("Incorrect password")

        const token = jwt.sign({id: teacher._id} , process.env.JWT_SECRET_KEY , {expiresIn: "20d"})
        res.send(token)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// get profile 
router.get("/profile" , checkTeacher, async (req , res) =>{
    try {
        const teacher = await Teacher.findById(req.teacherId).select("-__v -password").populate({
            path:"classId",
            populate:["lessons" , {
                path:"classMembers" , 
                populate:"preformence"
            }]
        })
        res.json(teacher)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// compleate OR edit profile
router.put("/editProfile" , checkTeacher , validateBody(teacherEditJoi) , async (req , res) => {
    try {
        const { bio , avatar , name } = req.body
        const teacher = await Teacher.findByIdAndUpdate(req.teacherId , { $set: { bio , avatar , name} }, {new: true}).select("-__v -password")
        res.json(teacher)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// // get my class 

router.get("/class",checkTeacher , async(req , res ) => {
    const myclass = await OneClass.findOne({teacher: req.teacherId}).select("-teacher").populate("lessons").populate( {
        path: "classMembers" ,
        select: "-kidclass -joinedActivities -__v",
        populate:{
            path: "preformence",
            select: "-kidId -classId -__v"
        }
    })
    res.json(myclass)
})

// -----------  Lessons ------------
// add lesson
router.post("/class/:id/add-lesson" , checkTeacher , checkId , validateBody(lessoneJoi),  async (req , res) => {
    try {
        const {lessonName , description , photo , state } = req.body

        const lesson = new Lesson ({
            lessonName ,
            description , 
            photo ,
            state
        })
         await OneClass.findByIdAndUpdate(req.params.id , {$push: {lessons : lesson}})
        
        await lesson.save()
        res.json(lesson)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// delete lesson 
router.delete("/:classId/:lessonId" , checkTeacher , async (req , res ) => {
    try {
        await Lesson.findByIdAndRemove(req.params.lessonId) 
        await OneClass.findByIdAndUpdate(req.params.classId , {$pull: {lessons: req.params.lessonId}})


        await Teacher.findByIdAndUpdate(req.teacherId.class , {$pull: {lessons: req.params.lessonId}})
        res.send("lesson removed")
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// add preformence 
router.post("/:classId/:lessonId/preformences/:kidId" , checkTeacher , validateBody(preformenceJoi) , async(req , res) => {
    try {
        const lesson = await Lesson.findById(req.params.lessonId)
        if(!lesson) return res.status(404).send("This Lesson not found!")

        const kid = await Kid.findById(req.params.kidId)
        if(!kid) return res.status(404).send(`The kid with ${kid} id not found!`)

        // if(req.params.classId.teacher != req.teacherId) return res.status(403).send("Unauthorized action")

        const { score , note } = req.body

        const preformence = new Preformence ({
            kidId: kid ,
            classId : req.params.classId,
            lessonId : lesson,
            score ,
            note
        })
        await Kid.findByIdAndUpdate(kid , {$push: {preformence}})
        await preformence.save()
        res.send("preformence added")
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// delete preformence 
router.delete("/:lessonId/preformences/:kidId/:id" , checkTeacher , checkId , async (req , res) => {
    try {
        const lesson = await Lesson.findById(req.params.lessonId)
        if(!lesson) return res.status(404).send("the lesson not found!")
        const kid = await Kid.findById(req.params.kidId)
        if(!kid) return res.status(404).send(" kid not found!")
        const preformence = await Preformence.findById(req.params.id)
        if(! preformence ) return res.status(404).send("not found")

        await Preformence.findByIdAndRemove(req.params.id)
        await Kid.findByIdAndUpdate(req.params.kidId , {$pull : {preformence: preformence._id}})
        res.send("Removed")
    } catch (error) {
        res.status(500).send(error.message)
    }
})

module.exports = router