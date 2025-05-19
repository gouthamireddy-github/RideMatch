const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const port = process.env.PORT || 4000
const mongoose = require("mongoose")
const connectCloudinary = require("./config/cloudinary");
const driversRoutes = require("./driver/router/driverRouter") 
const userRoutes = require("./Rider/router/RiderRouter") 
const rideRoutes = require("./Ride/router/rideRoute")


const app = express()
dotenv.config()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
// app.use(authmiddleware)


// diver routes
app.use("/driver",driversRoutes)

// user routes
app.use("/rider",userRoutes)

// ride routes
app.use("/ride",rideRoutes)


mongoose.connect(process.env.MONGOURI)
.then(() => 
   {
    console.log("MongoDB connected")
    app.listen(port, () => {
    
        console.log(`Server running at http://localhost:${port}`);
    });
   
   })
.catch(err => console.error("MongoDB connection error:", err));
connectCloudinary()


