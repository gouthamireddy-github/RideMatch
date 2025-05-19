const ride = require('../model/rideModel');
const driversDetails = require('../../driver/model/drivermodel');
const ridersDetails = require('../../Rider/model/RiderModel');
const transporter = require('../../mail/mailer');


// Create a new ride
exports.createRide = async (req, res) => {
    const { driverId, pickupLocation, dropoffLocation, departureTime, availableSeats, fareAmount } = req.body;

    try {
        if (!driverId || !pickupLocation || !dropoffLocation || !departureTime || !availableSeats || !fareAmount) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const driver = await driversDetails.findById(driverId);
        if (!driver) {
            return res.status(404).json({ message: "Driver not found" });
        }

        const newRide = await ride.create({
            driverId,
            pickupLocation,
            dropoffLocation,
            departureTime: new Date(departureTime), // ensure proper date object
            availableSeats,
            fareAmount
        });

        if (!newRide) {
            return res.status(500).json({ message: "Error creating ride" });
        }

        res.status(201).json({
            message: "Ride created successfully",
            ride: newRide
        });

    } catch (error) {
        res.status(500).json({
            message: "Error creating ride",
            error: error.message || "Unknown error"
        });
    }
};

// get all rides
exports.getAllRides = async (req,res) => {
    try {
        const rides = await ride.find()
        .populate({path: 'driverId', select: 'name phone_number email image_Url image_Url car_model'})
        .sort({ departureTime: 1 });
        if (!rides || rides.length===0){
            return res.status(404).json({ message: "No rides found" });
        }
        res.status(200).json({
            message: "Rides fetched successfully",
            rides
        });
    }catch (error) {
        res.status(500).json({
            message: "Error fetching rides",
            error: error.message || "Unknown error"
        });
    }
}

// get ride by id
exports.getRideById = async (req,res) => {
    const {rideId} = req.params;
    try {
        const rideDetails = await ride.findById(rideId)
        .populate({path: 'driverId', select: 'name phone_number email image_Url image_Url car_model'});
        if (!rideDetails) {
            return res.status(404).json({ message: "Ride not found" });
        }
        res.status(200).json({
            message: "Ride fetched successfully",
            ride: rideDetails
        });
    }catch (error) {
        res.status(500).json({
            message: "Error fetching ride",
            error: error.message || "Unknown error"
        });
    }
}

// book ride
exports.bookRide = async (req, res) => {
    const { rideId } = req.params;
    const { riderId, seatsBooked } = req.body;

    try {
        // Input validation
        if (!riderId || seatsBooked === undefined) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const seats = parseInt(seatsBooked, 10);
        if (!Number.isInteger(seats) || seats <= 0) {
            return res.status(400).json({ message: "Invalid number of seats booked" });
        }

        // Find ride and populate driver info
        const rideDetails = await ride.findById(rideId).populate("driverId", "name");
        if (!rideDetails) {
            return res.status(404).json({ message: "Ride not found" });
        }

        // Check for duplicate booking
        if (rideDetails.acceptedRiders.includes(riderId)) {
            return res.status(400).json({ message: "You have already booked this ride" });
        }

        // Check seat availability
        if (rideDetails.availableSeats < seats) {
            return res.status(400).json({ message: "Not enough seats available" });
        }

        // Calculate fare
        const farePerSeat = rideDetails.farePerSeat || 0; // default to 0 if not present
        const totalFare = farePerSeat * seats;

        // Update ride details
        rideDetails.availableSeats -= seats;
        rideDetails.requestedRiders.push(riderId);
        await rideDetails.save();

        // Find rider details
        const rider = await ridersDetails.findById(riderId);
        if (rider?.email) {
            const formattedTime = new Date(rideDetails.departureTime).toLocaleString();

            // Send email
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: rider.email,
                subject: "Ride Booking Confirmation",
                text: `Hi ${rider.name}, your ride from ${rideDetails.pickupLocation} to ${rideDetails.dropoffLocation} is confirmed.
                Departure: ${formattedTime}
                Driver: ${rideDetails.driverId.name || "N/A"}
                Seats Booked: ${seats}
                Fare per Seat: ₹${farePerSeat}
                Total Fare: ₹${totalFare}`
                            });
                        }

        // Respond with success
        res.status(200).json({
            message: "Ride booked successfully",
            ride: rideDetails,
            seatsBooked: seats,
            farePerSeat,
            totalFare
        });

    } catch (error) {
        res.status(500).json({
            message: "Error booking ride",
            error: error.message || "Unknown error"
        });
    }
};


// accept ride by driver
exports.acceptRide = async (req, res) => {
    const { rideId } = req.params;
    const { driverId, riderId } = req.body;

    try {
        // Validate input
        if (!driverId || !riderId) {
            return res.status(400).json({ message: "Driver ID and Rider ID are required" });
        }

        // Find ride
        const rideDetails = await ride.findById(rideId);
        if (!rideDetails) {
            return res.status(404).json({ message: "Ride not found" });
        }

        // Check driver ownership
        if (rideDetails.driverId.toString() !== driverId) {
            return res.status(403).json({ message: "You are not authorized to accept riders on this ride" });
        }

        // Confirm rider actually requested
        if (!rideDetails.requestedRiders.includes(riderId)) {
            return res.status(400).json({ message: "Rider has not requested this ride" });
        }

        // Move rider from requested → accepted
        rideDetails.requestedRiders = rideDetails.requestedRiders.filter(
            id => id.toString() !== riderId
        );
        rideDetails.acceptedRiders.push(riderId);
        await rideDetails.save();

        // Fetch driver and rider details
        const [driver, rider] = await Promise.all([
            driversDetails.findById(driverId),
            ridersDetails.findById(riderId)
        ]);

        // Send email to rider
        if (rider?.email) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: rider.email,
                subject: "Your Ride Request Was Accepted",
                text: `Hi ${rider.username}, your ride from ${rideDetails.pickupLocation} to ${rideDetails.dropoffLocation} has been accepted. Departure time: ${rideDetails.departureTime}. Driver: ${driver?.name}.`
            });
        }

        // Send email to driver
        if (driver?.email) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: driver.email,
                subject: "You Accepted a Rider",
                text: `Hi ${driver.name}, you accepted a ride request from ${rider?.name}. Pickup: ${rideDetails.pickupLocation}. Dropoff: ${rideDetails.dropoffLocation}. Departure: ${rideDetails.departureTime}.`
            });
        }

        // Respond success
        res.status(200).json({
            message: "Rider accepted successfully and notifications sent",
            ride: rideDetails
        });

    } catch (error) {
        res.status(500).json({
            message: "Error accepting ride",
            error: error.message || "Unknown error"
        });
    }
};

// cancel rideBooking
exports.cancelBooking = async (req,res) => {
    const { rideId } = req.params;
    const { riderId } = req.body;

    try {
        // Validate input
        if (!riderId) {
            return res.status(400).json({ message: "Rider ID is required" });
        }

        // Find ride
        const rideDetails = await ride.findById(rideId);
        if (!rideDetails) {
            return res.status(404).json({ message: "Ride not found" });
        }

        // Check if rider is accepted
        if (!rideDetails.acceptedRiders.includes(riderId)) {
            return res.status(400).json({ message: "You have not booked this ride" });
        }

        // Remove rider from accepted list
        rideDetails.acceptedRiders = rideDetails.acceptedRiders.filter(
            id => id.toString() !== riderId
        );
        rideDetails.availableSeats += 1; // Increment available seats
        await rideDetails.save();

        // Fetch rider details
        const rider = await ridersDetails.findById(riderId);

        // Send email to rider
        if (rider?.email) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: rider.email,
                subject: "Ride Cancellation Confirmation",
                text: `Hi ${rider.username}, your ride from ${rideDetails.pickupLocation} to ${rideDetails.dropoffLocation} has been cancelled.`
            });
        }

        // Respond success
        res.status(200).json({
            message: "Ride cancelled successfully",
            ride: rideDetails
        });

    } catch (error) {
        res.status(500).json({
            message: "Error cancelling ride",
            error: error.message || "Unknown error"
        });
    }
}

// cancel ride 
exports.cancelRide = async (req, res) => {
    const { rideId } = req.params;
    const { driverId } = req.body;

    try {
        // Validate input
        if (!driverId) {
            return res.status(400).json({ message: "Driver ID is required" });
        }

        // Find ride
        const rideDetails = await ride.findById(rideId);
        if (!rideDetails) {
            return res.status(404).json({ message: "Ride not found" });
        }

        // Check driver ownership
        if (rideDetails.driverId.toString() !== driverId) {
            return res.status(403).json({ message: "You are not authorized to cancel this ride" });
        }

        // Mark ride as canceled
        rideDetails.status = "Cancelled"; // Mark the ride status as cancelled
        rideDetails.acceptedRiders = []; // Remove all accepted riders
        rideDetails.requestedRiders = []; // Remove all requested riders
        rideDetails.availableSeats = 4; // Reset available seats to total seats

        // Save the updated ride details
        await rideDetails.save();

        // // Fetch driver details
        const driver = await driversDetails.findById(driverId);

        // Send email to driver
        if (driver?.email) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: driver.email,
                subject: "Ride Cancellation Confirmation",
                text: `Hi ${driver.name}, your ride from ${rideDetails.pickupLocation} to ${rideDetails.dropoffLocation} has been canceled. We apologize for the inconvenience.`
            });
        }

        // Notify all riders about the cancellation
        const riderPromises = rideDetails.acceptedRiders.map(async (riderId) => {
            const rider = await ridersDetails.findById(riderId);
            if (rider?.email) {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: rider.email,
                    subject: "Ride Cancellation Notification",
                    text: `Hi ${rider.username}, your ride from ${rideDetails.pickupLocation} to ${rideDetails.dropoffLocation} has been canceled. We apologize for the inconvenience.`
                });
            }
        });

        // Wait for all rider email notifications
        await Promise.all(riderPromises);

        // Respond with success
        res.status(200).json({
            message: "Ride canceled successfully",
            ride: rideDetails
        });

    } catch (error) {
        res.status(500).json({
            message: "Error canceling ride",
            error: error.message || "Unknown error"
        });
    }
};

// get rides by driverId
exports.getRidesByDriverId = async (req,res) => {
    const {driverId} = req.params;
    try {
         // Validate driverId
        if (!driverId) {
            return res.status(400).json({ message: "Driver ID is required" });
        }

        // Find rides by driverId
        const rides = await ride.find({ driverId })
        .populate({path: 'driverId', select: 'name phone_number email image_Url image_Url car_model'})
        .sort({ departureTime: 1 });

        // finding rides did by driver
        if (!rides || rides.length===0){
            return res.status(404).json({ message: "No rides found for this driver" });
        }

        // Respond with rides
        res.status(200).json({
            message: "Rides fetched successfully",
            rides
        });
    }catch (error) {
        res.status(500).json({
            message: "Error fetching rides",
            error: error.message || "Unknown error"
        });
    }
}

// get rides by riderId
exports.getRidesByRiderId = async (req,res) => {
    const {riderId} = req.params;
    try {
         // Validate riderId
        if (!riderId) {
            return res.status(400).json({ message: "Rider ID is required" });
        }

        // Find rides by riderId
        const rides = await ride.find({ acceptedRiders: riderId })
        .populate({path: 'driverId', select: 'name phone_number email image_Url image_Url car_model'})
        .sort({ departureTime: 1 });

        // finding rides did by driver
        if (!rides || rides.length===0){
            return res.status(404).json({ message: "No rides found for this rider" });
        }

        // Respond with rides
        res.status(200).json({
            message: "Rides fetched successfully",
            rides
        });
    }catch (error) {
        res.status(500).json({
            message: "Error fetching rides",
            error: error.message || "Unknown error"
        });
    }
}