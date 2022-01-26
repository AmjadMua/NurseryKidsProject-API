const jwt = require("jsonwebtoken")
const { Parent } = require("../models/Parent")

const checkParent = async (req , res , next ) => {
try {
    const token = req.header("Authorization")
    if(!token) return res.status(400).send("Token is missing!")

    const dcryption = jwt.verify(token , process.env.JWT_SECRET_KEY)
    const parentId = dcryption.id 

    const parent = await Parent.findById(parentId)
    if(!parent) return res.status(404).send("Parent not found")

    req.parentId = parentId
    next()
    
} catch (error) {
    res.status(500).send(error.message)
}
}

module.exports = checkParent