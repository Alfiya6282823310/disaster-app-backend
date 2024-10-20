const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcrypt")
const jsonwebtoken = require("jsonwebtoken")
const adminModel = require("./model/admin")

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://alfiyakn:alfiyakn@cluster0.l8relji.mongodb.net/disasterDb?retryWrites=true&w=majority&appName=Cluster0")
//admin signup
app.post("/adminSignUp", (req, res) => {
    let input = req.body
    let hashedPassword = bcrypt.hashSync(input.password, 10)
    input.password = hashedPassword
    console.log(input)
    let result = new adminModel(input)
    result.save()
    res.json({ "status": "success" })
})

app.listen(8080, () => {
    console.log("server started")
})