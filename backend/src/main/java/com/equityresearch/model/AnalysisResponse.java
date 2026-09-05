package com.equityresearch.model;

public class AnalysisResponse {
    private String ticker;
    private Double risk_percentage;
    private String summary;
    private Double sentiment_score;
    private Double volatility_score;

    public String getTicker() {
        return ticker;
    }

    public void setTicker(String ticker) {
        this.ticker = ticker;
    }

    public Double getRisk_percentage() {
        return risk_percentage;
    }

    public void setRisk_percentage(Double risk_percentage) {
        this.risk_percentage = risk_percentage;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public Double getSentiment_score() {
        return sentiment_score;
    }

    public void setSentiment_score(Double sentiment_score) {
        this.sentiment_score = sentiment_score;
    }

    public Double getVolatility_score() {
        return volatility_score;
    }

    public void setVolatility_score(Double volatility_score) {
        this.volatility_score = volatility_score;
    }
}