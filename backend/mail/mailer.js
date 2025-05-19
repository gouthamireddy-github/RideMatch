// utils/mailer.js
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,       // your email
    pass: process.env.EMAIL_PASSWORD    // your email password or app password
  }
});

module.exports = transporter;
