const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    userId: { type: String, unique: true },  // ทำให้ `userId` ไม่ซ้ำกัน
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    verificationToken: { type: String },
    isVerified: { type: Boolean, default: false },
  }, {
    timestamps: true
  });  

module.exports = mongoose.model('users', userSchema);
