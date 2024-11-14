// models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    email: { type: String, required: true }, // Store user's email instead of userId reference
    message: { type: String, required: true },
    imageUrl: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', postSchema);
