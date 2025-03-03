import { User } from "../models/user.model.js"
import bcrypt from "bcryptjs"
import {z} from "zod"
import jwt from "jsonwebtoken"
import { config } from "dotenv"
import { Purchase } from "../models/purchase.model.js"
import { Course } from "../models/course.model.js"

export const signup = async (req, res) => {
    const {firstName, lastName, email, password} = req.body
    const userSchema = z.object({
        firstName: z.string().min(2,{message:"firstName must be atleast 2 char long"}),
        lastName: z.string().min(2,{message:"lastName must be atleast 2 char long"}),
        email: z.string().email(),
        password: z.string().min(6,{message:"password must be atleast 6 char long"})
    })
    const validatedData = userSchema.safeParse(req.body)
    if(!validatedData.success){
        return res.status(400).json({errors: validatedData.error.issues.map((err) => err.message)})
    }
    const hashedPassword = await bcrypt.hash(password,10)
    try {
        const existingUser = await User.findOne({email: email})
        if(existingUser){
            return res.status(400).json({errors:"User already exists"})
        }
        const newUser = new User({firstName, lastName, email, password:hashedPassword})
        await newUser.save()
        res.status(201).json({message:"Signup successful", newUser})
    } catch (error) {
        res.status(500).json({errors:"Error in signup"})
        console.log("Error in signup", error)
    }
}

export const login = async(req, res) => {
    const{email, password} = req.body
    try {
        const user = await User.findOne({email: email})
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!user || !isPasswordCorrect){
            return res.status(403).json({errors:"Invalid credentials"})
        }
        const token = jwt.sign({
            id: user._id,
        }, process.env.JWT_USER_PASSWORD,{expiresIn: "1d"})
        const cookieOptions = {
            expires: new Date(Date.now() + 24*60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:"Strict"
        }
        res.cookie("jwt",token, cookieOptions)
        res.status(201).json({message: "Login successful", user, token})
    } catch (error) {
        res.status(500).json({errors: "Error in login"})
        console.log("error in login",error)
    }
}

export const logout = (req, res) => {
    try {
        if(!req.cookies.jwt){
            return res.status(401).json({errors: "Kindly login first"})
        }
        res.clearCookie("jwt")
        res.status(200).json({message: "Logged out successfully"})
    } catch (error) {
        res.status(500).json({errors:"Error in logout"})
        console.log("Error in logout",error)
    }
}

export const purchases = async (req, res) => {
    const userId = req.userId
    try {
        const purchased = await Purchase.find({userId})
        let purchasedCourseId = []
        for(let i = 0; i < purchased.length; i++){
            purchasedCourseId.push(purchased[i].courseId)
        }
        const courseData = await Course.find({
            _id:{ $in: purchasedCourseId },
        })
        res.status(200).json({purchased, courseData})
    } catch(error) {
        res.status(500).json({errors: "Error in purchases"})
        console.log("Error in purchase", error)
    }
}