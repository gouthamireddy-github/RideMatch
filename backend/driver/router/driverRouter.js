const express = require("express");
const driverRoutes = express.Router();
const drivercontroller = require("../Controller/drivercontroller");
const authmiddleware = require("../../middleware/authmiddleware");
const multer = require("multer");
const path = require("path");



// Set up multer storage
const storage = multer.memoryStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../../uploads/"); // Ensure this directory exists
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname); // Use a unique filename
    },
});

// Multer upload configuration
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Driver routes
driverRoutes.get("/", drivercontroller.getalldrivers);
driverRoutes.get("/:id", drivercontroller.getDriversById);
driverRoutes.post("/register", upload.single("image_Url"), drivercontroller.addDriver);
driverRoutes.post("/login", drivercontroller.loginDriver);
driverRoutes.put("/:id", authmiddleware, drivercontroller.updatedriver);
driverRoutes.delete("/:id", authmiddleware, drivercontroller.deletedriver);

module.exports = driverRoutes;