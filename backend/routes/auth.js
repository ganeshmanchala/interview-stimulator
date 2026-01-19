// routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/User");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

function makeToken(user) {
  const payload = { id: user._id, email: user.email, name: user.name };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/auth/signup  { username, password, name, email? }

// ===== LOCAL SIGNUP =====
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash: hash });
    await user.save();

    res.json({ message: "Signup successful" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== LOCAL LOGIN =====
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash || "");
    if (!ok)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = makeToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/google  { id_token } -- existing flow, but using User model
router.post("/google", async (req, res) => {
  try {
    const { id_token } = req.body || {};
    if (!id_token) return res.status(400).json({ error: "missing id_token" });
    if (!googleClient) return res.status(500).json({ error: "google client not configured" });

    const ticket = await googleClient.verifyIdToken({ idToken: id_token, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload || {};

    let user = await User.findOne({ googleId });
    if (!user) {
      // if same email exists (username/password signup), link accounts by email
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        user.name = user.name || name;
        user.picture = user.picture || picture;
        await user.save();
      } else {
        user = new User({ googleId, email, name, picture });
        await user.save();
      }
    }

    const token = makeToken(user);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, picture: user.picture, dashboard: user.dashboard } });
  } catch (err) {
    console.error("Google login error", err);
    res.status(401).json({ error: "invalid_token" });
  }
});

module.exports = router;
