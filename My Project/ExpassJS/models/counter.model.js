const mongoose = require('mongoose');
const { Schema } = mongoose;

// สร้าง schema สำหรับ counter
const counterSchema = new Schema({
    name: { type: String, required: true },
    count: { type: Number, required: true }
});

module.exports = mongoose.model('Counter', counterSchema);
