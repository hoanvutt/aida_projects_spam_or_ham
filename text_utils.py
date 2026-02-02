import re

def basic_clean(text: str) -> str:
    """Lightweight email text normalization."""
    if text is None:
        return ""
    text = str(text).lower()
    text = re.sub(r"http\S+|www\.\S+", " URL ", text)
    text = re.sub(r"\S+@\S+", " EMAIL ", text)
    text = re.sub(r"\d+", " NUM ", text)
    # keep letters and whitespace only
    text = re.sub(r"[^a-z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text
