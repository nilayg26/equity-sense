package com.equityresearch.repository;

import com.equityresearch.model.StockAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockAnalysisRepository extends JpaRepository<StockAnalysis, Long> {
}