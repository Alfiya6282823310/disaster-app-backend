const { now } = require("mongoose");
const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  district: { type: String, required: true },
  localBodyType: { type: String },
  localBody: { type: String },
  resourceCategory: { type: String, required: true },
  resourceName: { type: String, required: true },
  resourceQuantity: { type: Number, required: true },
  date:{type:Date,
    default:Date.now
},
//approved: { type: Boolean, default: false }, // Add this line
 // requestedBy: { type: String, required: true },
});


const ResourceModel = mongoose.model('Resource', resourceSchema);
module.exports = ResourceModel;