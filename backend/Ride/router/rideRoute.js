const express = require('express');
const rideRoutes = express.Router();
const rideController = require('../controller/rideController');
const authmiddleware = require('../../middleware/authmiddleware');

// Ride routes
rideRoutes.post('/create',authmiddleware, rideController.createRide);
rideRoutes.get('/getAllRides', rideController.getAllRides); // Public
rideRoutes.get('/getAllRides/:rideId', rideController.getRideById); // Public
rideRoutes.post('/bookRide/:rideId', authmiddleware, rideController.bookRide);
rideRoutes.post('/acceptRide/:rideId', authmiddleware, rideController.acceptRide);
rideRoutes.delete('/cancelbooking/:rideId',  rideController.cancelBooking);
rideRoutes.delete('/cancelRide/:rideId',  rideController.cancelRide);
rideRoutes.get('/getRidesByDriverId/:driverId',rideController.getRidesByDriverId); // Public
rideRoutes.get('/getRidesByRiderId/:riderId', rideController.getRidesByRiderId); // Public

// export the rideRoutes
module.exports = rideRoutes;