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
   SERVER START
   ============================================ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend działa na porcie", PORT));










// ====== ElevenLabs TTS ======
const ELEVEN_VOICE_ID = "DmPxCx2UnIDWBi70DMxr";
const ELEVEN_URL = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}`;

app.post("/api/tts", async (req, res) => {
  try {
    const text = (req.body?.text || "").trim();
    if (!text) {
      return res.status(400).send("No text provided");
    }

    // 👇 NAZWA ZMIENNEJ MA BYĆ TAKA, JAK NA RENDERZE
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error("Brak ELEVENLABS_API_KEY w zmiennych środowiskowych");
      return res.status(500).send("ELEVENLABS_API_KEY not configured");
    }

    const response = await fetch(ELEVEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.3,
          similarity_boost: 1.0,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("TTS error ElevenLabs:", response.status, errText.slice(0, 300));
      return res.status(500).send("TTS error");
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (err) {
    console.error("TTS endpoint error:", err);
    res.status(500).send("TTS internal error");
  }
});


