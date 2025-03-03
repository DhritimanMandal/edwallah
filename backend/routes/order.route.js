import express from "express"
import userMiddleware from "../middlewares/user.mid.js"
import { orderData } from "../controllers/order.controller.js"

const router = express.Router()

router.post("/",userMiddleware,orderData)

export default router