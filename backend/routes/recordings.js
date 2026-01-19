const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, "uploads");
const REPORT_DIR = path.join(__dirname, "reports");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

const COLAB_API_URL = "https://troglodytic-unacclimatized-theola.ngrok-free.dev/process";

// ✅ POST recording endpoint
router.post("/sessions/:sessionId/recordings", upload.single("file"), async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId = "", userId = "", question = "" } = req.body || {};

    if (!req.file) return res.status(400).json({ error: "file required" });

    const recordingId = uuidv4();
    const savedPath = req.file.path;

    // Save metadata
    const meta = {
      recordingId,
      sessionId,
      questionId,
      userId,
      originalName: req.file.originalname,
      filePath: savedPath,
      createdAt: new Date().toISOString(),
      status: "uploaded"
    };

    await fs.promises.writeFile(
      path.join(REPORT_DIR, `${recordingId}.meta.json`),
      JSON.stringify(meta, null, 2)
    );

    console.log("🔗 Sending to Flask worker:", COLAB_API_URL);

    // Correct file field name "file" to match Flask
    const form = new FormData();
    form.append("file", fs.createReadStream(savedPath));
    form.append("question", question || "Explain polymorphism in OOP");

    const colabResponse = await axios.post(COLAB_API_URL, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      timeout: 300000 // 5 minutes
    });

    const report = colabResponse.data;

    // Save report locally
    await fs.promises.writeFile(
      path.join(REPORT_DIR, `${recordingId}.report.json`),
      JSON.stringify(report, null, 2)
    );

    console.log(`✅ Report saved for recording: ${recordingId}`);
    res.json({ recordingId, status: "processed", meta, report });

  } catch (err) {
    console.error("❌ Upload handler error:", err.message || err);
    res.status(500).json({ error: "processing_failed", details: err.message });
  }
});

// GET report endpoint
router.get("/sessions/:sessionId/recordings/:recordingId/report", async (req, res) => {
  const { recordingId } = req.params;
  const fp = path.join(REPORT_DIR, `${recordingId}.report.json`);
  if (!fs.existsSync(fp)) return res.status(404).json({ error: "not_ready" });
  const data = JSON.parse(await fs.promises.readFile(fp));
  res.json(data);
});

module.exports = router;
