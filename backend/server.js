// server.js
require("dotenv").config();
const axios = require("axios");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const questionGeneratorRouter = require("./routes/questionGenerator");
const recordings = require("./routes/recordings");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
require("dotenv").config();

ELEVENLABS_API_KEY="sk_85c71587f1a4cb2730c38250bbed805887530ec988a6cc0a"


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


app.post("/api/tts", async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    console.log("TTS request:", { text, voiceId });
    console.log("Using ElevenLabs API key:", !!process.env.ELEVENLABS_API_KEY);
    const response = await axios({
      method: "POST",
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      data: {
        text,
        model_id: "eleven_multilingual_v2"
      },
      responseType: "arraybuffer"
    });

    res.set("Content-Type", "audio/mpeg");
    res.send(response.data);

  } catch (error) {
    console.error("ElevenLabs error:",
      error.response?.data?.toString() || error.message
    );
    res.status(500).send("TTS failed");
  }
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
