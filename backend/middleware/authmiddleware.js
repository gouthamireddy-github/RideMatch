const jwt = require('jsonwebtoken');
// const Driver = require('../driver/Controller/drivercontroller');
// const Rider = require('../Rider/controller/RiderController');
 

function authmiddleware(req,res,next){
    console.log("authmiddleware")
    console.log("authmiddleware:")
    const token = req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({message:"No token provided"})
    }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();     
    }
    catch(err){
        return res.status(401).json({message:"Token invalid",error:err})
    }
}

module.exports = authmiddleware;
