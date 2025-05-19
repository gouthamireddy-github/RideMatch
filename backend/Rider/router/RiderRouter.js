const express = require('express');
const userRoutes = express.Router();
const userController = require('../controller/RiderController');
const authmiddleware = require('../../middleware/authmiddleware');

userRoutes.post('/register', userController.registerUser);
userRoutes.post('/login', userController.loginUser);
userRoutes.get('/getallusers', userController.getAllUsers);
userRoutes.get('/getuser/:id',userController.getUserById);
userRoutes.put('/updateuser/:id',authmiddleware ,userController.updateUser);
userRoutes.delete('/deleteuser/:id',authmiddleware, userController.deleteUser);

module.exports = userRoutes;