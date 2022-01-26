const express = require("express")
const Joi = require("joi")
const JoiObjectId = require("joi-objectid")
Joi.objectid = JoiObjectId(Joi)
const mongoose = require("mongoose")
const teachers = require("./routes/teachers")
const adminAction = require("./routes/adminActions")
const parents = require("./routes/parents")
require("dotenv").config()
const cors = require("cors")

mongoose
  .connect(
    "mongodb+srv://amjadill:JE8cSGlph4D4uhPI@cluster0.j6bza.mongodb.net/kidsNursery"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch(error => console.log("Error connecting to MongoDB", error))


const app = express()
app.use(express.json())
app.use(cors())


app.use("/kidsNursery/teachers", teachers)
app.use("/kidsNursery/admin" , adminAction)
app.use("/kidsNursery/parents" , parents)

const PORT = (5000)
app.listen( PORT , () => console.log("server is listening now!") , PORT)