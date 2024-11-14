const mongoose = require("mongoose");

// Schema for replies to messages
const replySchema = mongoose.Schema({
    replyMessage: { type: String, required: true },
    repliedDate: { type: Date, default: Date.now },
    repliedBy: { type: String } // Optional: can store the email or name of the officer replying
});

// Main schema for messages
const messageSchema = mongoose.Schema({
    message: { type: String, required: true }, // The complaint message
    email: { type: String, required: true }, // The user's email who posted the complaint
    district: { type: String, required: true }, // The district the message is associated with
    postedDate: { type: Date, default: Date.now }, // Date the message was posted
    replies: [replySchema] // Add replies as an array of replySchema
});

// Creating the message model
const messageModel = mongoose.model("Message", messageSchema);
module.exports = messageModel;
