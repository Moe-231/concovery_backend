import cors from 'cors'; 
import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'

const postGress = require("./routes/postGress")
const googleRoutes = require("./routes/googleRoutes")

const app = express()

dotenv.config()

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/postgress", postGress)
app.use("/google", googleRoutes)

const PORT = 8080
app.listen(PORT, () => {
    `Server is running on port ${PORT}`
})