import cors from 'cors'; 
import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'

import postGres from './routes/postGress.js'
import googleRoutes from './routes/googleRoutes.js'

const app = express()

dotenv.config()

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/postgress", postGres)
app.use("/google", googleRoutes)

const PORT = 8080
app.listen(PORT, () => {
    `Server is running on port ${PORT}`
})