import dotenv from "dotenv"

const JWT_USER_PASSWORD = process.env.JWT_USER_PASSWORD
const JWT_ADMIN_PASSWORD = process.env.JWT_ADMIN_PASSWORD
const STRIPE_SECRET_KEY = "sk_test_51QjIO6JBexQjWzyqOlxW5e7dLGMqGxbFD8UpF1awlJQDYrlBXwVJuWyr8nGqY4wkJPE2hU964dPqnB2qpEpVPuQu00giAdWmOL"

export default {
    JWT_USER_PASSWORD,
    JWT_ADMIN_PASSWORD,
    STRIPE_SECRET_KEY,
}