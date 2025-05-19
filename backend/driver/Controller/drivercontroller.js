// const Driver = require("../model/drivermodel");
const driversDetails = require("../model/drivermodel.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const streamifier = require("streamifier");

dotenv.config();

//get all drivers
exports.getalldrivers= async(req,res)=>{
        try{
            const drivers = await driversDetails.find();
            res.status(200).json(drivers);
        }catch(error){
            res.status(500).json({message:"error fetching students",
                error: error.message || "Unknown error"})
        }
}

//get a driver by id
exports.getDriversById = async(req,res)=>{
    const {id} = req.params
    try{
        const driver = await driversDetails.findById(id);
        if(!driver){
            return res.status(404).json({message:"driver not found"})
        }
        res.status(200).json(driver);
    }catch(error){
        res.status(500).json({message:"error fetching student",error})
    }
}

//creating a driver

exports.addDriver = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const imageUploaded = await streamUpload(req);
    const imageurl = imageUploaded.secure_url;

    const newDriver = new driversDetails({
      ...req.body,
      password: req.body.password.trim(),
      image_Url: imageurl,
    });

    await newDriver.save();

    res.status(201).json({ message: "Driver registered successfully", driver: newDriver });
  } catch (error) {
    res.status(500).json({ message: "Registration error", error: error.message });
  }
};


// login a driver
exports.loginDriver = async (req,res) =>{
    console.log("login driver")
    const {email,password} = req.body;
    try{
        const driver = await driversDetails.findOne({email});
        if(!driver){
            res.status(400).json({message:"driver not found"})
        } 
        const isMatch = await bcrypt.compare(password,driver.password);
        if(!isMatch){
            res.status(400).json({message:"invalid credentials"})
        } 
        //debug
        console.log("Entered password:", password);
        console.log("Saved password (hashed):", driver.password);

        const token = jwt.sign({password:driver.password},process.env.JWT_SECRET,{expiresIn:"30d"})
        res.status(200).json({message:"login successful",
            driver:driver,
            token
        })
    }catch(error){
        res.status(500).json({message:"error logging in driver",
            error:error.message || "Unknown error"})
    }
}

//updating a driver
exports.updatedriver = async (req, res) => {
    const { id } = req.params;
    try {
        const driver = await driversDetails.findById(id);
        if (!driver) {
            return res.status(404).json({ message: "Driver not found" });
        }

        const updatedriver = await driversDetails.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: "Data updated successfully", Driver: updatedriver });
    } catch (error) {
        res.status(500).json({ message: "Error updating driver", error });
    }
};


//deleting a driver
exports.deletedriver = async(req,res)=>{
    const {id} = req.params
    try{
        const driver = await driversDetails.findById(id);
        if(!driver){
            res.status(404).json({message:"driver not found"});
        }
        await driversDetails.findByIdAndDelete(id);
        res.status(200).json({message:"data deleted successfully"});
    }catch(error){
        res.status(500).json({message:"error deleting student",error})
    }
}