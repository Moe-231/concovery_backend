import express from "express";
import axios from "axios";
import { calculateDistance } from "../services/distanceCalculation.js";

const router = express.Router();

router.get("/fetchPredictions", async (req, res) => {
  console.log("Request made to fetchPredictios Routes");
  console.log("Query Param Address value is ", req.query.address);
  const address = req.query.address;
  try {
    const responseData = await axios.get(
      "https://maps.googleapis.com/maps/api/place/autocomplete/json",
      {
        params: {
          input: address,
          key: process.env.GOOGLE_API_KEY,
          components: "country:AU",
        },
      },
    );
    if (responseData.status == 200) {
      res.status(200).json({
        predictions: responseData.data,
        error: null,
      });
      return;
    }
  } catch (error) {
    res.status(404).json({
      predictions: null,
      error: error,
    });
    return;
  }
});

router.get("/fetchRoute", async (req, res) => {
  console.log("Request made to fetchRoute route :)");
  if (
    (!req.query.userLat,
    !req.query.userLng,
    !req.query.destLat,
    !req.query.destLng)
  ) {
    res.status(400).json({
      routePath: null,
      error: "Missing query params",
    });
    return;
  }
  const userLat = req.query.userLat;
  const userLng = req.query.userLng;
  const destLat = req.query.destLat;
  const destLng = req.query.destLng;

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json`,
      {
        params: {
          origin: `${userLat},${userLng}`,
          destination: `${destLat},${destLng}`,
          key: process.env.GOOGLE_API_KEY,
        },
      },
    );
    if (response.status == 200 && response.data.routes.length) {
      const routeSteps = response.data.routes[0].legs[0].steps;
      const decodedPath = routeSteps.map((step) => ({
        lat: step.start_location.lat,
        lng: step.start_location.lng,
      }));

      // Last Desination Point of the ad location
      decodedPath.push({
        lat: parseFloat(destLat),
        lng: parseFloat(destLng),
      });
      res.status(200).json({
        routePath: decodedPath,
        error: null,
      });
      return;
    }
  } catch (error) {
    res.status(404).json({
      routePath: null,
      error: error,
    });
  }
});

router.get("/nearbyplaces", async (req, res) => {
  console.log("Nearby places api called :)");
  const radius = 3000;
  const searches = [
  { type: "hospital" },
  { type: "doctor", keyword: "medical clinic" },
  { type: "doctor", keyword: "sports medicine" },
  { type: "doctor", keyword: "physiotherapy" }
];
  let results = [];
  const { lat, lng } = req.query;
  try {
    for (const searche of searches) {
    const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json`, { params : {
            location: `${lat},${lng}`,
            radius,
            type : searche.type,
            keyword : searche.keyword, 
            key: process.env.GOOGLE_API_KEY
        }},
      );

      results = [...results, ...response.data.results];     
       
    }
    const uniqueResults = [...new Map(results.map(place => [place.place_id, place])).values()]
    const formattedResults =  uniqueResults.map((place) => {
        const distance = calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng);
                return {
                placeId: place.place_id,
                name: place.name,
                address: place.vicinity,
                locationType: place.types.includes("hospital") ? "Hospital" : "GP",
                rating: place.rating,
                phoneNo: place.international_phone_number,
                isOpen: place.opening_hours ? place.opening_hours.open_now : 'Call to Verify',
                distance,
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
                }
    });
    formattedResults.sort((a, b) => a.distance - b.distance)
    const nearestPlaces = formattedResults.slice(0, 5);
    res.status(200).json({
        nearbyplaces: nearestPlaces,
        error: null,
      });   
      return         
  } catch (error) {
    console.log("error is ", error)
     res.status(500).json({
      nearbyplaces: null,
      error: error,
    });
    return;
  }
});

export default router;
