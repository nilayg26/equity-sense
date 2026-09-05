import os
import time
from google import genai

def generate_summary(ticker: str, news_headlines: list[str]) -> str:
    if not news_headlines:
        return f"No recent news articles found for {ticker}."

    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    context = "\n".join(news_headlines)
    prompt = f"Summarize the following financial news for {ticker} in one concise paragraph for a retail investor:\n{context}"
    
    models = ['gemini-3.5-flash-lite', 'gemini-2.5-flash', 'gemini-1.5-flash']
    last_error = ""
    
    for model in models:
        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=prompt
                )
                return response.text
            except Exception as e:
                last_error = str(e)
                if "503" in last_error or "429" in last_error:
                    time.sleep(2 ** attempt)
                    continue
                break
                
    return f"AI Summary unavailable. Last Error: {last_error}"