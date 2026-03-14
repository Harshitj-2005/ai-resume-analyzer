const express = require('express');

const authcontroller = require('../controllers/auth.controller');

const authmiddleware = require('../middleware/auth.middleware');
const router = express.Router();


    //register user
    router.post('/register', authcontroller.registerusercontroller);

    //login router
    router.post('/login', authcontroller.loginusercontroller);

    //logout router
    router.get('/logout', authcontroller.logoutusercontroller);

    //get me router
    router.get('/get-me', authmiddleware, authcontroller.getmecontroller);  


module.exports = router;