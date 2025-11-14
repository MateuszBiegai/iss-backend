from flask import Flask, request, jsonify
import openai
import os

app = Flask(__name__)

openai.api_key = os.environ.get("OPENAI_API_KEY")

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    msg = data.get("message", "")

    odpowiedz = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": msg}],
        max_tokens=300,
        temperature=0.8
    )

    text = odpowiedz.choices[0].message["content"]
    return jsonify({"reply": text})

@app.route("/")
def home():
    return "ISS Backend działa ✔"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
