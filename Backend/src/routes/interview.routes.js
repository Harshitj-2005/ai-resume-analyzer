const express = require('express');
const authmiddleware = require('../middleware/auth.middleware');
const generateInterviewReportcontroller  = require('../controllers/interview.controller');
const upload = require('../middleware/file.middleware');

const interviewRouter = express.Router();


interviewRouter.post('/',authmiddleware.authUser, upload.single('resume'), generateInterviewReportcontroller);


module.exports = interviewRouter;