const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Cloudinary configuration
const connectCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
  });

  // Debug output to check if env vars are loaded
  console.log("Cloudinary config:", {
    cloud_name: process.env.CLOUDINARY_NAME || "missing",
    api_key: process.env.CLOUDINARY_API_KEY ? "set" : "missing",
    api_secret: process.env.CLOUDINARY_SECRET_KEY ? "set" : "missing"
  });
};

module.exports = connectCloudinary;
