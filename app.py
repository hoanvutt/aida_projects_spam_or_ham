# app.py
# FastAPI API for Spam/Ham classification using the exported model.
#
# Run locally:
#   pip install -r requirements.txt
#   uvicorn app:app --host 0.0.0.0 --port 8000
#
# Example request:
#   POST /predict
#   { "subject": "Hi", "message": "Win a free iPhone now!!!" }
#
# Response:
#   { "label": "spam", "is_spam": true, "spam_probability": 0.98 }

import os
from text_utils import basic_clean  # needed for joblib unpickle
import joblib
from fastapi import FastAPI
from pydantic import BaseModel, Field

MODEL_PATH = os.getenv("MODEL_PATH", "spam_ham_nb.joblib")

app = FastAPI(title="Spam/Ham Email Classifier (Naive Bayes)")

class EmailPayload(BaseModel):
    subject: str | None = Field(default=None, description="Email subject (optional)")
    message: str | None = Field(default=None, description="Email body/content (optional)")
    text: str | None = Field(default=None, description="Raw text (optional). If provided, used directly.")

@app.on_event("startup")
def load_model():
    global model
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f"Model file not found at {MODEL_PATH}. Set MODEL_PATH env var or place file next to app.")
    model = joblib.load(MODEL_PATH)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict(payload: EmailPayload):
    # Accept either:
    # - text
    # - or subject + message
    if payload.text and payload.text.strip():
        combined = payload.text.strip()
    else:
        subj = (payload.subject or "").strip()
        msg = (payload.message or "").strip()
        combined = (subj + "\n" + msg).strip()

    if not combined:
        return {"error": "Empty input. Provide 'text' or 'subject'/'message'."}

    # model predicts labels: 'ham' or 'spam'
    label = model.predict([combined])[0]
    probs = model.predict_proba([combined])[0]
    # classes_ should be ['ham', 'spam'] but we handle safely:
    class_to_prob = {cls: float(p) for cls, p in zip(model.classes_, probs)}
    spam_prob = class_to_prob.get("spam", 0.0)

    return {
        "label": label,
        "is_spam": label == "spam",
        "spam_probability": spam_prob,
        "ham_probability": class_to_prob.get("ham", 0.0),
    }
