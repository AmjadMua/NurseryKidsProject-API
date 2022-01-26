const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const express = require("express")
const validateBody = require("../middleware/validateBody")
const { adminJoi , Admin , loginJoi} = require("../models/Admin")
const router = express.Router()
const jwt = require("jsonwebtoken")
const { Teacher , teacherJoi} = require("../models/Teacher")
const checkAdmin = require("../middleware/checkAdmin")
const {classJoi , OneClass} = require("../models/Class")
const { Lesson } = require("../models/Lesson")
const {Activity , activityJoi , editActivityJoi} = require("../models/Activity")
const{ parentJoi , Parent} = require("../models/Parent")
const { kidJoi , Kid } = require("../models/Kid")
const checkId = require("../middleware/checkId")

//---------------------------------------  Admin section --------------------------------------

// signup
router.post("/signup", validateBody(adminJoi) , async (req , res) => {
    try {
        const {username , email , password} = req.body 
        const adminFound = await Admin.findOne({email})
        if(adminFound) return res.status(400).send("The Admin allready registered!")

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        const admin = new Admin ({
            username , 
            email , 
            password: hash
        })

        await admin.save()
        delete admin._doc.password

        res.json(admin)
    } catch (error) {
        res.status(500).send(error.message)
    }
    

})

// Login 
router.post("/login" , validateBody(loginJoi), async (req , res) => {
    try {
      const { username , password } = req.body
      const admin = await Admin.findOne({username})
      if(!admin) return res.status(404).send("Admin not found!")
      
      const valid = await bcrypt.compare(password , admin.password)
      if(!valid) return res.status(400).send("Incorrect password")

      const token = jwt.sign({id: admin._id} , process.env.JWT_SECRET_KEY , {expiresIn: "20d"})
      res.send(token)
    } catch (error) {
        res.status(500).send(error.message)
    }
})
// get profile 
router.get("/profile" , checkAdmin , async (req , res) => {
    try {
        const admin = await Admin.findById(req.adminId).select("-password -__v")
        if(!admin) return res.status(404).send("Admin not found!")

        res.json(admin)
    } catch (error) {
        res.status(500).send(error.message)
    }
})


//get all activities
router.get("/all-activities" , checkAdmin , async(req , res) => {
    try {
        const allActivities = await Activity.find().select("-__v").populate("teamMembers")
        res.json(allActivities)
    } catch (error) {
        res.status(500).send(error.message)
    }
})
// add activity 
router.post("/add-activity" , checkAdmin , validateBody(activityJoi) , async (req , res) => {
    try {
        const { activityName , description , date } = req.body

        const activity = new Activity ({activityName , description , date})
        await activity.save()
        res.json(activity)
    } catch (error) {
        res.status(500).send(error.message)
    }
}) 

// edit Activity 
router.put("/edit-activity/:id" , checkAdmin , checkId , validateBody(editActivityJoi), async (req , res) => {
    try {
        const activity = await Activity.findById(req.params.id)
        if(!activity) return res.status(404).send("Activity not found!")

        const editedAct = await Activity.findByIdAndUpdate(req.params.id , {$set: req.body} , {new: true})
        res.json(editedAct)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// delete Activity 
router.delete("/delete-activity/:id" , checkAdmin, checkId , async (req , res ) => {
    try {
         await Activity.findByIdAndRemove(req.params.id)
        res.send("Activity removed")
    } catch (error) {
        res.status(500).send(error.message)
    }
})


//------------------------------ Dealing  with teachers section ----------------------------------

// get all techers
router.get("/allteachers" , checkAdmin , async (req , res) => {
    try {
        const teachers = await Teacher.find().select("-__v -password").populate({
            path: "classId",
            populate: "lessons"
        })
        res.json(teachers)   
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// add techer
router.post("/add-teacher", checkAdmin ,validateBody(teacherJoi), async (req , res) => {
    try {
        const {name , username , email , password , classId} = req.body
       
        const teacherFound = await Teacher.findOne({email})
        if(teacherFound) return res.status(400).send("The teacher allready registered")

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        const teacher = new Teacher ({
            name ,
            username , 
            email , 
            password: hash,
            classId,
        })
        await OneClass.findByIdAndUpdate(classId , {$set: {teacher: teacher._id}})
        await teacher.save()
        delete teacher._doc.password

        res.json(teacher)
        
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// Delete teacher
router.delete("/removeTeacher/:id" , checkAdmin , checkId , async (req , res) => {
    try {
        const teacher = await Teacher.findByIdAndRemove(req.params.id)
        if (!teacher) return res.status(404).send("teacher not found")
        await OneClass.findByIdAndUpdate(teacher.classId._id , {$set: {teacher: null}} )
        res.send("teacher removed")
    } catch (error) {
        res.status(500).send(error.message)
    }
})


// ----------- On Classes


// get all classes
router.get("/all-classes" , checkAdmin , async (req , res) => {
    try {
       const classes = await OneClass.find().select("-__v").populate({
        path: "teacher",
        select :"-__v -password -bio -email -class -_id" }).populate({
            path: "classMembers",
            select: "-__v -kidclass -joinedActivities"
        }).populate("lessons")
       res.json(classes) 
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// add class
router.post("/add-class" , checkAdmin , validateBody(classJoi), async (req , res) =>{
    try {
        const {nameOfClass , teacher} = req.body

        const classFound = await OneClass.findOne({nameOfClass})
        if(classFound) return res.status(400).send("This class allready exist")

        const newClass = new OneClass ({
            nameOfClass,
            teacher
        })
        await Teacher.findByIdAndUpdate(teacher , {$set: {classId: newClass._id}})
        await newClass.save()
        res.json("added the class")
    } catch (error) {
        res.status(500).send(error.message)
    }
} )

// edit class 
router.put("/edit-class/:classId" , checkAdmin ,  async (req , res) =>{
    try {
        const {nameOfClass , teacher} = req.body

        const classFound = await OneClass.findByIdAndUpdate(req.params.classId , {$set: {nameOfClass , teacher}} ,  {new: true})
        if(!classFound) return res.status(400).send("Not found")

        await Teacher.findByIdAndUpdate(teacher , {$set: {classId: classFound}})
        res.json(classFound)
    } catch (error) {
        res.status(500).send(error.message)
    }
} )

// Delete class 
router.delete("/deleteClass/:id" , checkAdmin , checkId , async (req , res) => {
    try {
        const foundclass = await OneClass.findByIdAndRemove(req.params.id)
        if (!foundclass) return res.status(404).send("class not found!")

        console.log(foundclass.teacher);
        if(foundclass.teacher) await Teacher.findByIdAndRemove(foundclass.teacher.classId)
        res.send("class deleted")
        
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// -------------- lessons --------------
// get all lessons 
router.get("/lessons" , checkAdmin , async (req , res) => {
    try {
        const lessons = await Lesson.find()
        res.json(lessons) 
    } catch (error) {
        res.status(500).send(error.message)
    }
})


// -------------------------------- Dealing with parent section -----------------------------------

// get all parents
router.get("/all-parents" , checkAdmin , async(req , res) => {
    try {
        const parents = await Parent.find().select("-__v -password").populate({
            path: "kids", 
            select: "-__v",
            populate: {
                path: "kidclass"
            }
        })
        res.json(parents)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// add parent 
router.post("/add-parent" , checkAdmin , validateBody(parentJoi), async (req , res) => {
    try {
        const { parentFullName , username , email , password} = req.body

        const parentFound = await Parent.findOne({email})
        if(parentFound) return res.status(400).send("This parent allready registered")

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password , salt)

        const parent = new Parent ({
            parentFullName ,
            username ,
            email,
            password : hash ,
        })

        await parent.save()
        delete parent._doc.password

        res.json(parent)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// delete parent 
router.delete("/delete-parent/:id" , checkAdmin , checkId, async (req , res) => {
    try {
        const parent = await Parent.findById(req.params.id)
        if(!parent) return res.status(404).send("This parent not found!")
        await Parent.findByIdAndDelete(req.params.id)
        res.send("parent is removed")
    } catch (error) {
        res.status(500).send(error.message)
    }
})
 
// ---------- Kids --------
// get all kids
router.get("/all-kids" , checkAdmin , async (req , res) => {
    try {
        const kids = await Kid.find()
        res.json(kids)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// add kid to parent 
router.post("/parent/:id/add-kid" , checkAdmin , checkId , validateBody(kidJoi) , async (req , res) => {
    try {
        const parent = await Parent.findById(req.params.id)
        if(!parent) return res.status(404).send("parent is not found!")

        const { kidName , kidAge , kidclass , avatar} = req.body
        const kid = new Kid ({
            kidName,
            kidAge,
            kidclass,
            avatar
        })
        await Parent.findByIdAndUpdate(req.params.id , {$push: {kids: kid}})
        await OneClass.findByIdAndUpdate(kidclass , {$push: {classMembers: kid}})
        await kid.save()
        res.send(kid)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// delete kid 
router.delete("/parent/:parentId/remove-kid/:id" , checkAdmin , checkId , async(req , res ) => {
    try {
        const parent = await Parent.findById(req.params.parentId)
        if(!parent) return res.status(404).send("this parent not found! ")

        const kid = await Kid.findById(req.params.id)
        if(!kid) return res.status(404).send("The kid not found!")

        await Kid.findByIdAndRemove(req.params.id)
        await Parent.findByIdAndUpdate(req.params.parentId , {$pull: {kids: req.params.id}})
        await OneClass.findByIdAndUpdate(req.params.id.kidclass , {$pull : {classMembers: req.params.id }})

        res.send("the kid is reomved")
    } catch (error) {
        res.status(500).send(error.message)
    }
})
module.exports = router