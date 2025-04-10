# utils/relevance_checker.py

import requests
from bs4 import BeautifulSoup
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

def fetch_page_content(url):
    """
    Fetches and extracts clean, meaningful content from a webpage for relevance analysis.
    """
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
        response = requests.get(url, headers=headers, timeout=7)
        response.raise_for_status()  # Raise if status code is not 2xx

        soup = BeautifulSoup(response.text, 'html.parser')

        # Remove scripts/styles for cleaner content
        for tag in soup(["script", "style", "noscript", "header", "footer", "nav"]):
            tag.decompose()

        title = soup.title.string if soup.title else ''
        meta_tags = soup.find_all("meta")
        meta = ' '.join(tag.get('content', '') for tag in meta_tags if tag.get('content'))

        # Clean and condense body text
        body_text = soup.get_text(separator=' ', strip=True)
        body_text = re.sub(r'\s+', ' ', body_text)  # Collapse whitespace
        body_text = body_text[:2000]  # Limit for efficiency

        combined = f"{title} {meta} {body_text}"
        return combined.strip()

    except requests.RequestException as e:
        print(f"[fetch_page_content] Error fetching {url}: {e}")
        return ''


def get_relevance_score(subject, content):
    """
    Computes cosine similarity between the subject string and page content using TF-IDF.
    """
    if not content or not subject:
        return 0.0

    try:
        tfidf = TfidfVectorizer(stop_words="english").fit_transform([subject, content])
        score = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
        return round(float(score), 4)  # Round for clarity
    except Exception as e:
        print(f"[get_relevance_score] Error: {e}")
        return 0.0
