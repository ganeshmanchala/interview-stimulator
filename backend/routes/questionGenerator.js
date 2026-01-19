// // routes/questionGenerator.js
// // Express router that implements POST /generate-questions
// //
// // Place this file at routes/questionGenerator.js and ensure server.js mounts it:
// //    app.use("/api", require("./routes/questionGenerator"));
// //
// // Environment variables used:
// // - GEMINI_ENABLED ("true"/"false")
// // - GEMINI_API_KEY
// // - GEMINI_ENDPOINT
// //
// // Dependencies: axios, nanoid
// // Install with: npm i axios nanoid

// const express = require("express");
// const axios = require("axios");
// const { nanoid } = require("nanoid");

// const router = express.Router();

// const GEMINI_ENABLED = (process.env.GEMINI_ENABLED || "false").toLowerCase() === "true";
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
// const GEMINI_ENDPOINT = process.env.GEMINI_ENDPOINT || "";

// /**
//  * Local fallback generator (safe)
//  * Returns array of objects: { id, text, difficulty, type }
//  */
// function simpleGenerate(role, experience, topics = [], count = 5) {
//   const out = [];
//   const tlist = Array.isArray(topics) && topics.length ? topics : ["general"];
//   for (let i = 0; i < count; i++) {
//     const topic = tlist[i % tlist.length];
//     const difficulty = i < 2 ? "easy" : i < 4 ? "medium" : "hard";
//     const kind = difficulty === "easy" ? "conceptual" : difficulty === "medium" ? "design" : "coding";
//     const verb = difficulty === "easy" ? "Explain" : difficulty === "medium" ? "Discuss" : "Design/implement";
//     const text = `(${difficulty.toUpperCase()}) ${role} — ${verb} a ${kind} task about "${topic}".`;
//     out.push({ id: nanoid(8), text, difficulty, type: kind });
//   }
//   return out;
// }

// /**
//  * generateWithGemini: call Gemini/Vertex endpoint to produce questions.
//  * NOTE: The request/response shape for Gemini/Vertex varies by setup.
//  * This function uses a generic POST { prompt } and attempts to parse a JSON response.
//  * You may need to adapt it to your Vertex/Gemini configuration.
//  */
// async function generateWithGemini(role, experience, topics = [], count = 5) {
//   if (!GEMINI_ENABLED) throw new Error("Gemini not enabled");
//   if (!GEMINI_API_KEY || !GEMINI_ENDPOINT) throw new Error("Gemini credentials not configured");

//   const topicStr = topics && topics.length ? topics.join(", ") : "general topics";

//   // A strict prompt that asks for pure JSON output
//   const prompt = `
// You are an expert technical interview question generator.

// Produce strictly valid JSON and nothing else, in this exact shape:
// {
//   "questions": [
//     { "id": "q1", "text": "question text", "difficulty": "easy|medium|hard", "type": "conceptual|design|coding|behavioral" },
//     ...
//   ]
// }

// Requirements:
// - Generate exactly ${count} distinct questions for the role "${role}".
// - Use topics: ${topicStr}
// - Use experience: "${experience}"
// - Keep each question concise (10-40 words).
// - Return only JSON.
// `.trim();

//   try {
//     // Generic POST — adapt body/headers to your actual Gemini/Vertex API
//     const resp = await axios.post(
//       GEMINI_ENDPOINT,
//       { prompt }, // adapt if required by your endpoint
//       {
//         headers: {
//           Authorization: `Bearer ${GEMINI_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//         timeout: 20000,
//       }
//     );

//     const body = resp.data;

//     // Attempt to locate model text in common fields
//     let modelText = null;
//     if (typeof body === "string") modelText = body;
//     else if (body.output_text) modelText = body.output_text;
//     else if (body.choices && body.choices[0] && (body.choices[0].text || body.choices[0].message)) {
//       modelText = body.choices[0].text || body.choices[0].message;
//     } else if (body.output && Array.isArray(body.output) && body.output[0]?.content) {
//       modelText = body.output[0].content.map((c) => (c.text ? c.text : "")).join("\n");
//     } else {
//       modelText = JSON.stringify(body);
//     }

//     // Parse modelText as JSON — model was instructed to output JSON
//     let parsed = null;
//     try {
//       parsed = JSON.parse(modelText);
//     } catch (err) {
//       // If there is extra text, try to extract JSON substring
//       const jsonMatch = modelText.match(/\{[\s\S]*\}/);
//       if (jsonMatch) {
//         parsed = JSON.parse(jsonMatch[0]);
//       } else {
//         throw new Error("Could not parse JSON from Gemini output");
//       }
//     }

//     if (!parsed || !Array.isArray(parsed.questions)) {
//       throw new Error("Gemini output did not contain a questions array");
//     }

//     // Normalize and return requested number
//     const questions = parsed.questions.slice(0, count).map((q, idx) => ({
//       id: q.id || nanoid(8),
//       text: (q.text || "").trim(),
//       difficulty: q.difficulty || (idx < 2 ? "easy" : idx < 4 ? "medium" : "hard"),
//       type: q.type || "conceptual",
//     }));

//     return questions;
//   } catch (err) {
//     console.error("generateWithGemini error:", err?.message || err);
//     throw err;
//   }
// }

// /**
//  * POST /generate-questions
//  * Body: { role, experience, topics: [], count }
//  * Response: { questions: [ {id,text,difficulty,type}, ... ] }
//  */
// router.post("/generate-questions", async (req, res) => {
//   try {
//     const { role, experience = "", topics = [], count = 5 } = req.body || {};
//     if (!role || typeof role !== "string" || role.trim() === "") {
//       return res.status(400).json({ error: "role is required" });
//     }

//     const topicList = Array.isArray(topics)
//       ? topics
//       : typeof topics === "string"
//       ? topics.split(",").map((s) => s.trim()).filter(Boolean)
//       : [];

//     // Try Gemini first (if enabled)
//     if (GEMINI_ENABLED) {
//       try {
//         const questions = await generateWithGemini(role, experience, topicList, Number(count) || 5);
//         return res.json({ questions });
//       } catch (gerr) {
//         console.warn("Gemini generation failed, falling back to local generator:", gerr?.message || gerr);
//       }
//     }

//     // Fallback local generator
//     const questions = simpleGenerate(role, experience, topicList, Number(count) || 5);
//     return res.json({ questions });
//   } catch (err) {
//     console.error("generate-questions handler error:", err?.message || err);
//     return res.status(500).json({ error: "internal_error" });
//   }
// });

// module.exports = router;



// routes/questionGenerator.js
// Uses Gemini Developer API (AI Studio) via @google/genai with API key.
// Mount at /api: app.use('/api', require('./routes/questionGenerator'));

const express = require("express");
const { nanoid } = require("nanoid");
const router = express.Router();

const GEMINI_ENABLED = (process.env.GEMINI_ENABLED || "false").toLowerCase() === "true";
const USE_VERTEX = (process.env.GEMINI_USE_VERTEXAI || "false").toLowerCase() === "true"; // we expect false for Developer API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-pro";

/* ---------- fallback generator ---------- */
function simpleGenerate(role, experience, topics = [], count = 5) {
  const out = [];
  const tlist = Array.isArray(topics) && topics.length ? topics : ["general"];
  for (let i = 0; i < count; i++) {
    const topic = tlist[i % tlist.length];
    const difficulty = i < 2 ? "easy" : i < 4 ? "medium" : "hard";
    const kind = difficulty === "easy" ? "conceptual" : difficulty === "medium" ? "design" : "coding";
    const verb = difficulty === "easy" ? "Explain" : difficulty === "medium" ? "Discuss" : "Design/implement";
    const text = `(${difficulty.toUpperCase()}) ${role} — ${verb} a ${kind} task about "${topic}".`;
    out.push({ id: nanoid(8), text, difficulty, type: kind });
  }
  return out;
}

/* ---------- Gemini Developer API call (via @google/genai) ---------- */
// Improved Gemini Developer API generation + tolerant JSON parsing
// Replace your existing generateWithGeminiDev with this improved version
async function generateWithGeminiDev(role, experience = "", topics = [], count = 5) {
  if (!GEMINI_ENABLED) throw new Error("Gemini not enabled");
  if (USE_VERTEX) throw new Error("generateWithGeminiDev called while USE_VERTEX is true");
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");

  const { GoogleGenAI } = require("@google/genai");
  const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const topicStr = Array.isArray(topics) && topics.length ? topics.join(", ") : "general topics";
  const example = {
    questions: [
      { id: "q1", text: "What is a deadlock? Explain with an example.", difficulty: "easy", type: "conceptual" },
      { id: "q2", text: "Design a thread-safe LRU cache for Java. Outline classes and synchronization.", difficulty: "hard", type: "design" }
    ]
  };

  const prompt = `
You are an expert technical interview question generator.

Return EXACTLY valid JSON and NOTHING ELSE. The JSON must follow this schema:

{
  "questions": [
    { "id": "<short id>", "text": "<question text>", "difficulty": "easy|medium|hard", "type": "conceptual|design|coding|behavioral" },
    ...
  ]
}

Generate exactly ${count} questions for the role "${role}" and topics: ${topicStr}. Use the experience level: "${experience}".

Example output (must follow this shape exactly):
${JSON.stringify(example, null, 2)}

Return only a JSON object exactly like the example above (no commentary, no markdown, no explanation).
`.trim();

  const model = GEMINI_MODEL;
  const config = {
    model,
    contents: prompt,
    config: {
      candidateCount: 1,
      maxOutputTokens: 1600, // tune if you see truncation
      temperature: 0.0,
    },
  };

  let response;
  try {
    response = await client.models.generateContent(config);
  } catch (err) {
    console.error("Gemini request failed:", err?.message || err);
    throw err;
  }

  // Helpful debug summary
  try {
    console.log("GenerateContentResponse summary:", {
      modelVersion: response?.modelVersion,
      responseId: response?.responseId,
      usage: response?.usageMetadata,
      candidatesCount: Array.isArray(response?.candidates) ? response.candidates.length : 0,
      finishReasons: Array.isArray(response?.candidates) ? response.candidates.map(c => c.finishReason) : undefined,
    });
  } catch (e) {
    console.log("Could not print response summary", e);
  }

  // === Robust extraction: attempt many known shapes ===
  let rawText = "";

  try {
    // 1) If candidates[] present, inspect each candidate
    if (Array.isArray(response?.candidates) && response.candidates.length > 0) {
      // We'll prefer extracting text out of nested shapes:
      for (const cand of response.candidates) {
        // case A: cand.content.parts is an array of { text: "..." }
        if (cand?.content && cand.content?.parts && Array.isArray(cand.content.parts)) {
          const text = cand.content.parts.map(p => p?.text || p?.value || "").join("");
          if (text && text.trim()) {
            rawText = text;
            break;
          }
        }

        // case B: cand.content is an array of content pieces [{ text: "..." }, ...]
        if (Array.isArray(cand.content)) {
          const text = cand.content.map(p => (p?.text || p?.value || "")).join("");
          if (text && text.trim()) {
            rawText = text;
            break;
          }
        }

        // case C: cand.content may have a `text` property directly
        if (cand?.content && typeof cand.content === "object" && cand.content.text) {
          rawText = cand.content.text;
          break;
        }

        // case D: cand may have an array 'content' deeper or other shapes; try to stringify then parse later
        // fallback to stringifying candidate if nothing else found
        if (!rawText) {
          rawText = JSON.stringify(cand);
        }
      }
    }

    // 2) If still empty, check response.output shape
    if (!rawText || !rawText.trim()) {
      if (Array.isArray(response?.output) && response.output[0]?.content) {
        rawText = response.output[0].content.map(c => (c?.text || c?.value || "")).join("\n");
      } else if (typeof response?.text === "string" && response.text.trim()) {
        rawText = response.text;
      } else if (response?.response?.text) {
        rawText = response.response.text;
      } else {
        rawText = JSON.stringify(response);
      }
    }
  } catch (err) {
    // worst-case fallback: stringify whole response
    rawText = JSON.stringify(response);
  }

  console.log("Raw Gemini output (extracted):\n", rawText);

  // --------- Sanitization & parsing ----------
  function sanitizeAndParse(text) {
    if (!text || typeof text !== "string") throw new Error("Empty model output");

    // 1) If text looks like a JSON-stringified object (starts with {"content":...), try to JSON.parse
    const trimmed = text.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsedOuter = JSON.parse(trimmed);
        // If outer structure contains the nested text, extract it
        // Path: parsedOuter.content.parts[*].text OR parsedOuter.candidates[*].content.parts[*].text
        // Try several known locations:
        if (parsedOuter?.content?.parts && Array.isArray(parsedOuter.content.parts)) {
          const txt = parsedOuter.content.parts.map(p => p?.text || p?.value || "").join("");
          if (txt) text = txt;
        } else if (Array.isArray(parsedOuter?.candidates) && parsedOuter.candidates.length > 0) {
          // candidate object stringified case
          for (const cand of parsedOuter.candidates) {
            if (cand?.content?.parts && Array.isArray(cand.content.parts)) {
              const txt = cand.content.parts.map(p => p?.text || p?.value || "").join("");
              if (txt) { text = txt; break; }
            } else if (Array.isArray(cand.content)) {
              const txt = cand.content.map(p => p?.text || p?.value || "").join("");
              if (txt) { text = txt; break; }
            } else if (cand?.content?.text) {
              text = cand.content.text;
              break;
            }
          }
        } else if (parsedOuter?.output && Array.isArray(parsedOuter.output) && parsedOuter.output[0]?.content) {
          const txt = parsedOuter.output[0].content.map(c => c?.text || c?.value || "").join("");
          if (txt) text = txt;
        }
      } catch (e) {
        // not JSON, continue
      }
    }

    let s = String(text);

    // Remove code fences / markdown wrappers
    s = s.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();

    // Normalize smart quotes
    s = s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

    // Extract substring between first '{' and last '}' to handle cases where there is extra wrapper text.
    const firstBrace = s.indexOf("{");
    const lastBrace = s.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      s = s.substring(firstBrace, lastBrace + 1);
    } else {
      // If no braces, see if it's an array and wrap it
      const arrMatch = s.match(/\[[\s\S]*\]/);
      if (arrMatch) s = `{"questions":${arrMatch[0]}}`;
    }

    // Remove trailing commas before } or ]
    s = s.replace(/,(\s*[}\]])/g, "$1");

    // Convert some single-quoted keys/values conservatively
    s = s.replace(/'(\s*\w+\s*)'\s*:/g, '"$1":');         // 'key':  -> "key":
    s = s.replace(/:\s*'([^']*)'/g, ': "$1"');            // : 'value' -> : "value"

    // Try parse
    try {
      return JSON.parse(s);
    } catch (err) {
      // fallback: try to pull "questions":[...] substring and parse it
      const questionsMatch = s.match(/"questions"\s*:\s*(\[[\s\S]*\])/);
      if (questionsMatch) {
        // sanitize qtext then parse
        let qtext = questionsMatch[1].replace(/,(\s*[}\]])/g, "$1").replace(/'/g, '"');
        try {
          const qarr = JSON.parse(qtext);
          return { questions: qarr };
        } catch (e2) {
          throw new Error("Could not parse questions array after sanitization: " + (e2.message || e2));
        }
      }
      throw new Error("Sanitization failed to yield valid JSON: " + (err.message || err));
    }
  }

  let parsed = null;
  try {
    parsed = sanitizeAndParse(rawText);
  } catch (err) {
    console.warn("Sanitize/parse failed:", err?.message || err);
    if (Array.isArray(response?.candidates) && response.candidates.some(c => c.finishReason === "MAX_TOKENS")) {
      console.warn("Warning: model finished due to MAX_TOKENS. Consider increasing maxOutputTokens to avoid truncation.");
    }
    throw err;
  }

  if (!parsed || !Array.isArray(parsed.questions)) {
    throw new Error("Gemini output JSON did not contain questions array after parsing");
  }

  const questions = parsed.questions.slice(0, count).map((q, idx) => ({
    id: q.id || nanoid(8),
    text: (q.text || "").trim(),
    difficulty: q.difficulty || (idx < 2 ? "easy" : idx < 4 ? "medium" : "hard"),
    type: q.type || "conceptual",
  }));

  return questions;
}



/* ---------- POST /generate-questions ---------- */
router.post("/generate-questions", async (req, res) => {
  try {
    const { role, experience = "", topics = [], count = 5 } = req.body || {};
    if (!role || typeof role !== "string" || role.trim() === "") {
      return res.status(400).json({ error: "role is required" });
    }

    const topicList = Array.isArray(topics)
      ? topics
      : typeof topics === "string"
      ? topics.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    // Try Gemini Developer API path
    if (GEMINI_ENABLED && !USE_VERTEX) {
      try {
        const questions = await generateWithGeminiDev(role, experience, topicList, Number(count) || 5);
        return res.json({ questions });
      } catch (err) {
        console.warn("Gemini Developer API failed, falling back:", err?.message || err);
      }
    }

    // Fallback
    const questions = simpleGenerate(role, experience, topicList, Number(count) || 5);
    return res.json({ questions });
  } catch (err) {
    console.error("Handler error:", err?.message || err);
    return res.status(500).json({ error: "internal_error" });
  }
});

module.exports = router;
