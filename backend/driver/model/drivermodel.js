const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// driver schema
const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true ,lowercase: true, match: /^\S+@\S+\.\S+$/},
  password: { type: String, required:true, minlength: 6 },
  license_number: { type: String, required: true, unique: true },
  vehicle_number: { type: String, required: true, unique: true },
  
  image_Url: { type: String, required: true, unique: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  phone_number: { type: String },
  car_model: { type: String },
  passenger_count: { type: Number },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Pending', 'Cancelled'],
    default: 'Pending'
  }
});



driverSchema.pre('save', async function (next) {
  console.log("Hashing password before save"); // Add this line
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});



const Driver = mongoose.model('Driver', driverSchema);
module.exports = Driver;



