// models/ResourceRequest.js
// models/ResourceRequest.js
const mongoose = require('mongoose');

const ResourceRequestSchema = new mongoose.Schema({
  resourceCategory: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, default: 'Pending' }, // Status as a string with default value "Pending"
  dateRequested: { type: Date, default: Date.now },
  district: { type: String,required:true },
});

const ResourceRequest = mongoose.model('ResourceRequest', ResourceRequestSchema);
module.exports = ResourceRequest;
