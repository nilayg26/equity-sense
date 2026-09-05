package com.equityresearch.controller;

import com.equityresearch.model.StockAnalysis;
import com.equityresearch.service.StockService;

import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping("/history")
    public List<StockAnalysis> getHistory() {
        return stockService.getAllHistory();
    }

    @GetMapping("/riskper")
    public StockAnalysis getRiskPercentage(@RequestParam String ticker) {
        return stockService.analyzeAndSave(ticker);
    }
}