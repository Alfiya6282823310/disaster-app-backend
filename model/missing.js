// models/MissingPersonModel.js
const mongoose = require('mongoose');

const MissingPersonSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    age: { type: Number, required: true },
    sex: { type: String, required: true },
    district: { type: String, required: true },
    place: { type: String, required: true },
    missingDate: { type: Date, required: true },
    contactNumber: { type: Number }
});

const MissingPersonModel = mongoose.model('MissingPerson', MissingPersonSchema);
module.exports = MissingPersonModel;
