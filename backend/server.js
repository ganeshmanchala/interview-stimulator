// server.js
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const questionGeneratorRouter = require("./routes/questionGenerator");
const recordings = require("./routes/recordings");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");

const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(bodyParser.json({ limit: "10mb" })); // increase limit for safety

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/interview_app";

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("Mongo connection failed", err);
    process.exit(1);
  });

// Mount routers
app.use("/api", questionGeneratorRouter);
app.use("/api", recordings);
app.use("/api/auth", authRouter); // -> /api/auth/signup, /api/auth/login, /api/auth/google
app.use("/api/user", userRouter);


app.get("/api/health", (req, res) => {
  res.json({ ok: true, timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
