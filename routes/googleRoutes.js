import express from 'express';
import cors from 'cors'; 
import axios from 'axios';

const router = express.Router()


router.get("/fetchPredictions", async (req, res) => {
    console.log("Request made to fetchPredictios Routes")
    console.log("Query Param Address value is ", req.query.address)
       const address = req.query.address
       try {
            const responseData = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
            params: {
                input: address,
                key: process.env.GOOGLE_API_KEY,
                components: 'country:AU'
            }
            })
            if(responseData.status == 200) {
                res.status(200).json({
                    predictions: responseData.data,
                    error: null
                })
                return
            } 
       } catch (error) {
            res.status(404).json({
                predictions: null,
                error: error
            })
            return
       }
})

export default router