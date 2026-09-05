from transformers import pipeline

sentiment_pipeline = pipeline("sentiment-analysis", model="ProsusAI/finbert")

def analyze_sentiment(texts: list[str]) -> float:
    if not texts:
        return 50.0
        
    results = sentiment_pipeline(texts)
    score_mapping = {"positive": 20.0, "neutral": 50.0, "negative": 80.0}
    
    total_score = sum(score_mapping.get(res['label'].lower(), 50.0) for res in results)
    
    return total_score / len(results)