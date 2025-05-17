import requests
from bs4 import BeautifulSoup
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from transformers import pipeline

# Initialize summarizer once
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Keywords
study_keywords = set([
    'syllabus', 'curriculum', 'university', 'college', 'lecture', 'assignment',
    'course', 'module', 'notes', 'textbook', 'academic', 'exam', 'question paper',
    'unit', 'chapter', 'semester', 'professor', 'ugc', 'nptel',
    'learning', 'study', 'research', 'education', 'class', 'grade',
    'study guide', 'student', 'academic paper', 'degree', 'class notes',
    'paper', 'study materials', 'online learning', 'academic resources', 'faculty'
])

topic_keywords = {
    "big data": ['big data', 'data science', 'hadoop', 'spark', 'data processing'],
    "ai": ['artificial intelligence', 'neural networks', 'deep learning', 'ML', 'AI algorithms'],
    "cloud computing": ['cloud', 'aws', 'azure', 'virtual machine', 'serverless', 'cloud storage'],
    "machine learning": [
        'machine learning', 'supervised learning', 'unsupervised learning', 'regression', 'classification',
        'scikit-learn', 'tensorflow', 'data modeling', 'ML algorithms'
    ],
    "deep learning": [
        'deep learning', 'neural networks', 'CNN', 'RNN', 'LSTM', 'backpropagation',
        'keras', 'tensorflow', 'computer vision', 'image recognition'
    ],
}

def fetch_page_content(url):
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers, timeout=7)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')
        for tag in soup(['script', 'style', 'noscript', 'header', 'footer', 'nav', 'aside']):
            tag.decompose()

        body_text = soup.get_text(separator=' ', strip=True)
        body_text = re.sub(r'\s+', ' ', body_text)
        return body_text[:4000]  # Limit for performance
    except Exception as e:
        print(f"[fetch_page_content] Error: {e}")
        return ''

def is_educational(content):
    count = sum(1 for word in study_keywords if word in content.lower())
    return count >= 3

def get_relevance_score(subject, content):
    if not subject or not content or not is_educational(content):
        return 0.0
    try:
        tfidf = TfidfVectorizer(stop_words='english').fit_transform([subject, content])
        score = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
        return round(float(score), 4)
    except Exception as e:
        print(f"[get_relevance_score] Error: {e}")
        return 0.0

def filter_relevant_sentences(content, topic=None):
    keywords = set(study_keywords)
    if topic and topic.lower() in topic_keywords:
        keywords.update(topic_keywords[topic.lower()])

    sentences = re.split(r'(?<=[.!?])\s+', content)
    filtered = [s for s in sentences if any(k.lower() in s.lower() for k in keywords)]
    return ' '.join(filtered[:40])  # Limit sentence count

def summarize_text(content, max_len=100):
    try:
        if len(content.split()) < 50:
            return content
        result = summarizer(content, max_length=max_len, min_length=30, do_sample=False)
        return result[0]['summary_text']
    except Exception as e:
        print(f"[summarize_text] Error: {e}")
        return content

def clean_and_summarize(content, topic=None):
    if not content or len(content) < 100:
        return "Content too short to summarize."

    filtered = filter_relevant_sentences(content, topic)
    if not filtered or len(filtered.split()) < 30:
        return "No relevant content found to summarize."

    return summarize_text(filtered)

