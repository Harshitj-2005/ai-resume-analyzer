const jwt = require("jsonwebtoken")
const blocklist = require('../models/blacklist.model');

async function authuser(req, res, next){
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({message: "token not found"})
    }
    const isblacklist = await blocklist.findOne({token});

    if(isblacklist){
        return res.status(401).json({message: "token is invalid"})
    } 

    try{
    const decode = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decode;

    next();
    }
    catch{
        return res.status(401).json({message: "invalid token"})
    }
}

module.exports = authuser;