const express=require ("express")
const mongoose=require ("mongoose")
const cors=require ("cors")
const bcrypt=require ("bcrypt")
const jsonwebtoken=require ("jsonwebtoken")

const app=express()
app.use(cors())
app.use(express.json())


app.listen(8080,()=>{
    console.log("server started")
})