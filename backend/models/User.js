// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  passwordHash: { type: String }, // bcrypt hash for username/password accounts
  googleId: { type: String, index: true, sparse: true }, // for Google SSO
  name: String,
  picture: String,
  // Dashboard metrics stored as averages (0..1)
  dashboard: {
    confidence: { type: Number, default: 0 },
    fluency: { type: Number, default: 0 },
    correctness: { type: Number, default: 0 },
    interviewsCount: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
