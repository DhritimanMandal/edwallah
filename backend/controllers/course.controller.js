import { Course } from "../models/course.model.js"
import { v2 as cloudinary } from 'cloudinary'
import { Purchase } from "../models/purchase.model.js"

export const createCourse = async (req, res) => {
    const adminId = req.adminId
    const {title,description,price} = req.body
    console.log(title,description,price)
    try {
        if(!title || !description || !price){
            return res.status(400).json({errors:"All fields are required"})
        }
        const {image} = req.files
        if(!req.files || Object.keys(req.files).length === 0){
            return res.status(400).json({errors: "No file uploaded"})
        }
        const allowedFormat = ["image/png", "image/jpeg"]
        if(!allowedFormat.includes(image.mimetype)){
            return res.status(400).json({errors: "Invalid file format (only JPEG and PNG are allowed"})
        }
        const cloud_response = await cloudinary.uploader.upload(image.tempFilePath)
        if(!cloud_response || cloud_response.error){
            return res.status(400).json({errors: "Error in uploading the file to cloudinary"})
        }
        const courseData = {
            title,
            description,
            price,
            image:{
                public_id: cloud_response.public_id,
                url: cloud_response.url
            },
            creatorId: adminId
        }
        const course = await Course.create(courseData)
        res.json({
            message: "Course created successfully",
            course
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Error in creating course"})
    }
}

export const updateCourse = async(req,res) => {
    const adminId = req.adminId
    const {courseId} = req.params
    const {title, description, price, image} = req.body
    try{
        const courseSearch = await Course.findById(courseId)
        if(!courseSearch){
            return res.status(404).json({errors:"Course not found"})
        }
        const course = await Course.findOneAndUpdate(
            {
                _id: courseId,
                creatorId: adminId,
            },
            {
                title,
                description,
                price,
                image:{
                    public_id: image?.public_id,
                    url: image?.url,
                }
            }
        )
        if(!course){
            return res.status(404).json({errors:"can't update, created by other admin"})
        }
        res.status(201).json({message:"Course updated successfully", course})
    } catch (error) {
        res.status(500).json({error:"Error in updating the course"})
        console.log("Error in updating the course", error)
    }
}

export const deleteCourse = async(req, res) =>{
    const adminId = req.adminId 
    const { courseId } = req.params
    try{
        const course = await Course.findOneAndDelete({
            _id: courseId,
            creatorId: adminId,
        })
        if(!course){
            return res.status(404).json({error:"Can't delete, created by other admin"})
        }
        res.status(200).json({errors: "Course deleted successfully"})
    } catch (error) {
        res.status(500).json({errors:"Error in course deleting"})
        console.log("Error in deleting the course", error)
    }
}

export const getCourses = async (req,res) => {
    try{
        const courses = await Course.find({})
        res.status(201).json({courses})
    } catch (error) {
        res.status(500).json({errors: "Error in getting courses"})
        console.log("error to get courses", error)
    }
}

export const courseDetails = async(req,res) => {
    const { courseId } = req.params
    try{
        const course = await Course.findById(courseId)
        if(!course){
            return res.status(404).json({error: "Course not found"})
        }
        res.status(200).json({course})
    } catch (error) {
        res.status(500).json({errors:"Error in getting course details"})
        console.log("Error in course details", error)
    }
}

import Stripe from "stripe"
import config from "../config.js"
const stripe = new Stripe(config.STRIPE_SECRET_KEY)
export const buyCourses = async(req, res) => {
    const {userId} = req
    const {courseId} = req.params
    try {
        const course = await Course.findById(courseId)
        if(!course){
            return res.status(404).json({errors : "Course not found"})
        }
        const existingPurchase = await Purchase.findOne({userId, courseId})
        if(existingPurchase){
            return res.status(400).json({errors : "User has already purchased this course"})
        }
        const amount = course.price
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "inr",
            payment_method_types:['card']
          })
        res.status(201).json({message: "Course purchased successfully",course, clientSecret: paymentIntent.client_secret})
    } catch (error) {
        res.status(500).json({errors : "Error in buying the course"})
        console.log("error in course buying", error)
    }
}