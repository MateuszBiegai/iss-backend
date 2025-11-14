import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

// ⭐ JEDEN poprawny CORS – działa dla POST i OPTIONS
app.use(cors({
  origin: "https://www.interactive-space-station.com",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

// ⭐ Render potrzebuje obsłużyć preflight OPTIONS
app.options("/api/chat", cors());

// OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Test endpoint
app.get("/", (req, res) => {
  res.send("ISS Backend działa ✔");
});

// ⭐ Właściwy endpoint
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend działa na porcie", PORT));
