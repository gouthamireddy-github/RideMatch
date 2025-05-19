const userDetails = require('../model/RiderModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config()


// register user
// Register User
exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await userDetails.findOne({ email: email.trim() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await userDetails.create({
      username,
      email: email.trim(),
      password: password.trim()
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating user",
      error: error.message || "Unknown error"
    });
  }
};


// Login User
exports.loginUser = async (req, res) => {
    console.log("login user")
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await userDetails.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in user",
      error: error.message || "Unknown error"
    });
  }
};



// get all users
exports.getAllUsers = async (req, res) => {
    try{
        const users = await userDetails.find();
        res.status(200).json({
            message: "Users fetched successfully",
            users
        });
    }catch (error) {
        res.status(500).json({
            message: "Error fetching users",
            error: error.message || "Unknown error"
        });
    }
}

// get user by id
exports.getUserById = async (req,res) => {
    const {id} = req.params;
    try{
        const user = await userDetails.findById(id);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json({
            message:"User fetched successfully",
            user
        })
    }catch(error){
        res.status(500).json({
            message:"Error fetching user",
            error:error.message || "Unknown error"
        })
    }
}

// update user
exports.updateUser = async (req,res) => {
    const {id} = req.params;
    try{
        const user = await userDetails.findById(id);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        const upadatedUser = await userDetails.findByIdAndUpdate(
            id,
            req.body,
            {new:true, runValidators:true}
        );
        res.status(200).json({
            message:"User updated successfully",
            user:upadatedUser   
        })
    }catch(error){
        res.status(500).json({
            message:"Error updating user",
            error:error.message || "Unknown error"
        })
    }
}

// delete user
exports.deleteUser = async(req,res) => {
    const {id} = req.params;
    try{
        const user = await userDetails.findById(id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        await userDetails.findByIdAndDelete(id);
        res.status(200).json({
            message: "User deleted successfully",
            user
        })
    }catch(error){
        res.status(500).json({
            message: "Error deleting user",
            error: error.message || "Unknown error"
        })
    }
}

