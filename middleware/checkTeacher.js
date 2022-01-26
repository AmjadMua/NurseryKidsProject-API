const jwt = require("jsonwebtoken")
const { Teacher} = require("../models/Teacher")

const checkTeacher = async (req , res , next) => {
    try {
        const token = req.header("Authorization")
        if(!token) return res.status(400).send("Token is missing")

        const decrybtToken = jwt.verify(token , process.env.JWT_SECRET_KEY)
        const teacherId = decrybtToken.id 

        const teacher = await Teacher.findById(teacherId)
        if(!teacher) return res.status(404).send("teacher not found")

        req.teacherId = teacherId
        next()
    } catch (error) {
        res.status(500).send(error.message)
    }
}

module.exports = checkTeacher