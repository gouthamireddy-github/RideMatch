const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    pickupLocation: {
        type: String,
        required: true
    },
    dropoffLocation: {
        type: String,
        required: true
    },
    departureTime: {
        type: Date,
        required: true
    },
    availableSeats: {
        type: Number,
        required: true
    },
    rideStatus: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    },
    requestedRiders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rider'
    }],
    acceptedRiders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rider'
    }],
    fareAmount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const Ride = mongoose.model('Ride', rideSchema);
module.exports = Ride;
