import yfinance as yf
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

from services.market_data import get_stock_volatility
from services.nlp_sentiment import analyze_sentiment
from services.llm_summary import generate_summary

load_dotenv()

app = FastAPI()

class AnalysisRequest(BaseModel):
    ticker: str

class AnalysisResponse(BaseModel):
    ticker: str
    risk_percentage: float
    summary: str
    sentiment_score: float
    volatility_score: float

def fetch_news(ticker: str) -> list[str]:
    url = f"https://query2.finance.yahoo.com/v1/finance/search?q={ticker}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=5)
        data = response.json()
        news_items = data.get("news", [])
        return [item.get("title", "") for item in news_items[:10] if "title" in item]
    except Exception:
        return []

@app.post("/analyze", response_model=AnalysisResponse)
def analyze_stock(request: AnalysisRequest):
    try:
        ticker = request.ticker.upper()
        
        headlines = fetch_news(ticker)
        volatility_score = get_stock_volatility(ticker)
        sentiment_score = analyze_sentiment(headlines)
        
        risk_percentage = (0.60 * volatility_score) + (0.40 * sentiment_score)
        summary = generate_summary(ticker, headlines)
        
        return AnalysisResponse(
            ticker=ticker,
            risk_percentage=round(risk_percentage, 2),
            summary=summary,
            sentiment_score=round(sentiment_score, 2),
            volatility_score=round(volatility_score, 2)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))