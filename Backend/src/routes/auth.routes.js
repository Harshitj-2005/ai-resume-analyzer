const express = require('express');

const authcontroller = require('../controllers/auth.controller');

const authmiddleware = require('../middleware/auth.middleware');
const authrouter = express.Router();


    //register user
    authrouter.post('/register', authcontroller.registerusercontroller);

    //login router
    authrouter.post('/login', authcontroller.loginusercontroller);

    //logout router
    authrouter.get('/logout', authcontroller.logoutusercontroller);

    //get me router
    authrouter.get('/get-me', authmiddleware.authUser, authcontroller.getmecontroller);  


module.exports = authrouter;