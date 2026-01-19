const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.split(" ")[1];
  if (!token) return res.status(401).json({ error: "unauthorized" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "invalid_token" });
  }
}

// 🟢 Fetch dashboard
router.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "user_not_found" });
    return res.json({ ok: true, dashboard: user.dashboard });
  } catch (err) {
    console.error("dashboard fetch error", err);
    res.status(500).json({ error: "server_error" });
  }
});

// 🟢 Update dashboard after interview
router.post("/dashboard/update", requireAuth, async (req, res) => {
  try {
    const { confidence, fluency, correctness } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "user_not_found" });

    const prev = user.dashboard;
    const newCount = prev.interviewsCount + 1;

    user.dashboard.confidence =
      (prev.confidence * prev.interviewsCount + confidence) / newCount;
    user.dashboard.fluency =
      (prev.fluency * prev.interviewsCount + fluency) / newCount;
    user.dashboard.correctness =
      (prev.correctness * prev.interviewsCount + correctness) / newCount;
    user.dashboard.interviewsCount = newCount;

    await user.save();
    res.json({ ok: true, dashboard: user.dashboard });
  } catch (err) {
    console.error("dashboard update error", err);
    res.status(500).json({ error: "server_error" });
  }
});



module.exports = router;
