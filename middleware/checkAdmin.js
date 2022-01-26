const jwt = require("jsonwebtoken")
const { Admin } = require("../models/Admin")

const checkAdmin = async (req , res , next) => {
    try {
        const token = req.header("Authorization")
        if(!token) return res.status(401).send("Token is missing")

        const decrybtToken = jwt.verify(token , process.env.JWT_SECRET_KEY)
        const adminId = decrybtToken.id
        
        const admin = await Admin.findById(decrybtToken.id)
        if(!admin) return res.status(404).send("Admin not found")

        req.adminId = adminId
        next()

    } catch (error) {
        res.status(500).send(error.message)
    }
}

module.exports = checkAdmin