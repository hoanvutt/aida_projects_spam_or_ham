# train_spam_ham_nb.py
# Train a Spam/Ham classifier (Naive Bayes) on enron_spam_data.csv
# Split: 90% train / 10% test, then export a reusable model pipeline.

import argparse
import re
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

from text_utils import basic_clean
