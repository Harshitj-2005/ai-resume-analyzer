const mongoose = require('mongoose');

//technical Question Schema
const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Technical question is required"]
    },
    intention: {
        type: String,
        required: [true, "Intention is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
}, {
    id: false
});

//Behavioral Question Schema
const BehavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Behavioral question is required"]
    },
    intention: {
        type: String,
        required: [true, "Intention is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
}, {
    id: false
});


//Skill Gap Schema
const SkillGapSchema = new mongoose.Schema({
    skill : {
        type: String,
        required: [true, "Skills is required"]
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high"],
        required: [true, "Skills is required"]
    }
}, {
    id: false
})


//Prepration Time
const PreprationTimeSchema = new mongoose.Schema({

    day: {
        type: Number,
        required: [true, "Day is required"]
    },
    focus: {
        type: String,
        required: [true, "focus is required"]
    },
    tasks: [{
        type: String,
        required: [true, "Task is required"]
    }]
}, {
    id: false
});

// main Interview Report Schema
const InterviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: [true, "Job description is required"]
    },
    resume: {
        type: String,
    },
    selfDescription: {
        type: String,
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
    }, 
    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [BehavioralQuestionSchema],
    skillGaps: [SkillGapSchema],
    preparationPlan: [PreprationTimeSchema],
    user:{
        type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
    },
    title: {
        type: String,
        required: [true, "Title is required"]
    }

},{
    timestamps: true
});

const InterviewReportModel = mongoose.model('InterviewReport', InterviewReportSchema);

module.exports = InterviewReportModel