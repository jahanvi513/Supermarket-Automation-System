package com.snumart.controller;

import com.snumart.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    @Autowired
    private ReportService reportService;
    
    @GetMapping("/sales")
    public Map<String, Object> generateSalesReport(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        return reportService.generateSalesReport(startDate, endDate);
    }
    
    @GetMapping("/inventory")
    public Map<String, Object> generateInventoryReport() {
        return reportService.generateInventoryReport();
    }
}
