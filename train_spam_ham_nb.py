# train_spam_ham_nb.py
# Train a Spam/Ham classifier (Naive Bayes) on enron_spam_data.csv
# Split: 90% train / 10% test, then export a reusable model pipeline.

import argparse
import re
import joblib
import pandas as pd
from text_utils import basic_clean
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

def basic_clean(text: str) -> str:
    text = str(text).lower()
    text = re.sub(r"http\S+|www\.\S+", " URL ", text)
    text = re.sub(r"\S+@\S+\.\S+", " EMAIL ", text)
    text = re.sub(r"\d+", " NUM ", text)
    text = re.sub(r"[^a-z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", default="enron_spam_data.csv", help="Path to CSV file")
    parser.add_argument("--model_out", default="spam_ham_nb.joblib", help="Output model file")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    args = parser.parse_args()

    df = pd.read_csv(args.csv)

    # Expected columns (from your file):
    # ['Message ID', 'Subject', 'Message', 'Spam/Ham', 'Date']
    # We'll use Subject + Message as input text, label = Spam/Ham
    df["Subject"] = df["Subject"].fillna("")
    df["Message"] = df["Message"].fillna("")
    X = (df["Subject"].astype(str).str.strip() + "\n" + df["Message"].astype(str).str.strip()).values
    y = df["Spam/Ham"].astype(str).str.lower().values  # 'spam' or 'ham'

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.10, random_state=args.seed, stratify=y
    )

    # Fast + deploy-friendly text vectorizer (no vocab to store)
    pipeline = Pipeline([
        ("vectorizer", HashingVectorizer(
            preprocessor=basic_clean,
            stop_words="english",
            ngram_range=(1, 2),
            alternate_sign=False,
            n_features=2**18
        )),
        ("clf", MultinomialNB(alpha=0.5))
    ])

    pipeline.fit(X_train, y_train)

    pred = pipeline.predict(X_test)
    proba = pipeline.predict_proba(X_test)

    acc = accuracy_score(y_test, pred)
    cm = confusion_matrix(y_test, pred, labels=["ham", "spam"])

    print("\n=== Evaluation (10% test) ===")
    print(f"Accuracy: {acc:.4f}")
    print("Confusion matrix (rows=true, cols=pred) [ham, spam]:")
    print(cm)
    print("\nClassification report:")
    print(classification_report(y_test, pred, digits=4))

    # Export model as a single pipeline
    joblib.dump(pipeline, args.model_out)
    print(f"\nSaved model to: {args.model_out}")

if __name__ == "__main__":
    main()
