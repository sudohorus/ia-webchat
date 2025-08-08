from flask import Flask, render_template, request, jsonify, session
import requests
import os
from dotenv import load_dotenv

load_dotenv()  

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')

CF_ACCOUNT_ID = os.getenv('CF_ACCOUNT_ID')
CF_API_TOKEN = os.getenv('CF_API_TOKEN')
MODEL = os.getenv('MODEL')

API_URL = f'https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/ai/run/{MODEL}'
HEADERS = {
    "Authorization": f"Bearer {CF_API_TOKEN}",
    "Content-Type": "application/json"
}

SYSTEM_PROMPT = {
    "role": "system",
    "content": (
        "Você é uma IA prestativa. "
        "Não use emojis em todas as frases, apenas quando fizer sentido. "
        "Prefira frases curtas e diretas, mas seja específica quando necessário. "
        "NUNCA corte a resposta. "
        "Sempre respeite o contexto do prompt."
        "Você sempre usa markdown para responder as perguntas."
    )
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ask', methods=["POST"])
def ask():
    user_input = request.json.get("message")
    history = session.get("chat_history", [])
    history.append({"role": "user", "content": user_input})

    messages = [SYSTEM_PROMPT] + history

    payload = {
        "messages": messages,
        "max_tokens": 2048,
        "temperature": 0.7
    }

    response = requests.post(API_URL, headers=HEADERS, json=payload)

    if response.status_code == 200:
        ai_reply = response.json().get("result", {}).get("response", "Sem resposta da IA.")
        history.append({"role": "assistant", "content": ai_reply})
        session["chat_history"] = history
    else:
        ai_reply = f"Erro: {response.status_code} - {response.text}"

    return jsonify({"reply": ai_reply})

@app.route('/reset', methods=["POST"])
def reset():
    session.pop("chat_history", None)
    return jsonify({"message": "Histórico limpo."})

if __name__ == "__main__":
    app.run(debug=True)
