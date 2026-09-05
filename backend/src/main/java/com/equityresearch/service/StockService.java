package com.equityresearch.service;

import com.equityresearch.model.AnalysisRequest;
import com.equityresearch.model.AnalysisResponse;
import com.equityresearch.model.StockAnalysis;
import com.equityresearch.repository.StockAnalysisRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class StockService {

    private final StockAnalysisRepository repository;
    private final RestTemplate restTemplate;

    public List<StockAnalysis> getAllHistory() {
        return repository.findAll();
    }

    public StockService(StockAnalysisRepository repository) {
        this.repository = repository;
        this.restTemplate = new RestTemplate();
    }

    public StockAnalysis analyzeAndSave(String ticker) {
        String pythonApiUrl = "http://127.0.0.1:8000/analyze";
        AnalysisRequest request = new AnalysisRequest();
        request.setTicker(ticker);

        AnalysisResponse response = restTemplate.postForObject(pythonApiUrl, request, AnalysisResponse.class);

        StockAnalysis analysis = new StockAnalysis();
        analysis.setTicker(response.getTicker());
        analysis.setRiskPercentage(response.getRisk_percentage());
        analysis.setSummary(response.getSummary());
        analysis.setSentimentScore(response.getSentiment_score());
        analysis.setVolatilityScore(response.getVolatility_score());
        analysis.setSearchedAt(LocalDateTime.now());

        return repository.save(analysis);
    }
}