import express from "express";
import cors from "cors";
import OpenAI from "openai";
import fetch from "node-fetch";

const app = express();

/* ============================================
   CORS – DZIAŁAJĄCY DLA POST + OPTIONS
   ============================================ */
app.use(cors({
  origin: "https://www.interactive-space-station.com",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

// Render wymaga pełnej obsługi preflight
app.options("*", cors());

app.use(express.json());

/* ============================================
   OPENAI
   ============================================ */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ============================================
   TEST
   ============================================ */
app.get("/", (req, res) => {
  res.send("ISS Backend działa ✔");
});

/* ============================================
   ENDPOINT CZATU
   ============================================ */
app.post("/api/chat", async (req, res) => {
  try {
    const userMsg = req.body.message || "";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Jesteś Astro Chat ISS – inteligentnym asystentem." },
        { role: "user", content: userMsg }
      ]
    });

    res.json({ reply: completion.choices[0].message.content });

  } catch (err) {
    console.error("Błąd API:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

/* ============================================
   ENDPOINT TTS — ElevenLabs
   ============================================ */
app.post("/api/tts", async (req, res) => {
  try {
    const text = req.body.text || "";

    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/DmPxCx2UnIDWBi70DMxr",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.3, similarity_boost: 1 }
        })
      }
    );

    const audioBuffer = await response.arrayBuffer();

    res.set({
      "Content-Type": response.headers.get("content-type") || "audio/mpeg",
      "Access-Control-Allow-Origin": "https://www.interactive-space-station.com"
    });

    res.send(Buffer.from(audioBuffer));

  } catch (err) {
    console.error("TTS error:", err);
    res.status(500).send("TTS server error");
  }
});

/* ============================================
   SERVER START
   ============================================ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend działa na porcie", PORT));
