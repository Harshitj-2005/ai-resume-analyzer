const user = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const blacklist = require('../models/blacklist.model');

async function registerusercontroller(req, res) {
    const {username, email, password} = req.body;

    if(!username || !email || !password){
        return res.status(400).json({message : "please provide username, email and password"});
    }

    const isuserexist = await user.findOne({
        $or: [{username}, {email}]
    })

    if(isuserexist){
        return res.status(400).json({
            message : "user already exist"
        })
    }

    const hash = await bcrypt.hash(password,10);

    const newuser = await user.create({
        username,
        email,
        password: hash
    })

    const token = jwt.sign(
    {_id: newuser._id, username: newuser.username},
    process.env.JWT_SECRET,
    {expiresIn: "1d"}
    )

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(201).json({message: "user register successfully",
            user: {
            _id: newuser._id,
            username: newuser.username,
            email: newuser.email
        }});
}

async function loginusercontroller(req, res) {
    const {email, password} = req.body


    if(!email || !password){
        return res.status(400).json({message : "please provide email and password"});
    }

    const isuserexist = await user.findOne({email});

    if(!isuserexist){
        return res.status(400).json({
            message : "user not found"
        })  
    }
    const ispasswordvalid = await bcrypt.compare(password, isuserexist.password);

    if(!ispasswordvalid){
        return res.status(400).json({
            message : "invalid email or password"
        })
    }

    const token = jwt.sign(
    {_id: isuserexist._id, username: isuserexist.username},
    process.env.JWT_SECRET,
    {expiresIn: "1d"}
    )

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({message: "user login successfully",
        user: {
            _id: isuserexist._id,
            username: isuserexist.username,
            email: isuserexist.email
        }
    });
}

async function logoutusercontroller(req, res) {
    const token = req.cookies.token;

    if(token){
        await blacklist.create({token});
    }

    res.clearCookie("token", {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production"
    });

    res.status(200).json({message: "user logout successfully"});
}

async function getmecontroller(req, res) {
    const founduser = await user.findById(req.user._id);

    res.status(200).json({message: "user detaild fetch successfully",
        user : {
            _id: founduser._id,
            username: founduser.username,
            email: founduser.email
        }
    })
}


module.exports = {
    registerusercontroller,
    loginusercontroller,
    logoutusercontroller,
    getmecontroller
}   