import yfinance as yf

def get_stock_volatility(ticker: str) -> float:
    stock = yf.Ticker(ticker)
    hist = stock.history(period="1mo")
    if hist.empty:
        return 50.0
    
    returns = hist['Close'].pct_change().dropna()
    volatility = returns.std() * (252 ** 0.5)
    
    normalized_vol = min(max(volatility / 0.5, 0.0), 1.0)
    return normalized_vol * 100