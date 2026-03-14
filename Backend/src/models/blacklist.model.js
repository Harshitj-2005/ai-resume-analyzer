const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "Token is required to be blocklisted"]
    },
    timestamp: {
        type: Date,
    }
});

const blacklist = mongoose.model('blacklist', blacklistSchema);

module.exports = blacklist;