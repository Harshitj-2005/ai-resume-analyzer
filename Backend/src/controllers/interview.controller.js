const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")





async function generateInterviewReportcontroller(req, res) {

    try {
        let resumeText = "";

        if (req.file && req.file.buffer) {
            const data = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
            resumeText = data.text;
        }

        const { selfDescription, jobDescription } = req.body

        if (!resumeText && !selfDescription) {
            return res.status(400).json({ message: "Either resume or self description is required." })
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user._id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (error) {
        console.error("Error generating report:", error);
        res.status(500).json({ message: "Failed to generate report", error: error.message })
    }

}


async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user._id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}



async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user._id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}



async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user._id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found or you don't have permission to access it."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

module.exports = { generateInterviewReportcontroller, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController }