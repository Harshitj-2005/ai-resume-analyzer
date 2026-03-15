const pdfParse = require("pdf-parse")
const interviewReportModel = require('../models/interviewReport.model');
const generateInterviewReport = require('../services/ai.service');

async function generateInterviewReportcontroller(req, res) {

    const resumecontent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
    const {jobDescription, selfDescription} = req.body;

    const interviewReportByAi = await generateInterviewReport({
        resume: resumecontent.text,
        jobDescription,
        selfDescription
     });

     const interviwereport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumecontent.text,
        jobDescription,
        selfDescription,
        ...interviewReportByAi  
     })

     res.status(201).json({
        message: "Interview report generated successfully",
        interviwereport
     })

}

module.exports = generateInterviewReportcontroller;