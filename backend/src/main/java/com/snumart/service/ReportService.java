package com.snumart.service;

import com.snumart.model.Invoice;
import com.snumart.model.InvoiceItem;
import com.snumart.model.Inventory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {
    @Autowired
    private InvoiceService invoiceService;
    
    @Autowired
    private InventoryService inventoryService;
    
    public Map<String, Object> generateSalesReport(LocalDateTime startDate, LocalDateTime endDate) {
        List<Invoice> invoices = invoiceService.getInvoicesByDateRange(startDate, endDate);
        
        double totalSales = invoices.stream()
            .mapToDouble(Invoice::getTotal)
            .sum();
        
        int totalTransactions = invoices.size();
        
        double averageTransactionValue = totalTransactions > 0 
            ? totalSales / totalTransactions 
            : 0;
        
        // Calculate top selling products
        Map<String, Integer> productQuantities = new HashMap<>();
        Map<String, Double> productRevenues = new HashMap<>();
        
        for (Invoice invoice : invoices) {
            for (InvoiceItem item : invoice.getItems()) {
                String productId = item.getProductId();
                int quantity = item.getQuantity();
                double revenue = item.getPrice() * quantity;
                
                productQuantities.put(
                    productId, 
                    productQuantities.getOrDefault(productId, 0) + quantity
                );
                
                productRevenues.put(
                    productId, 
                    productRevenues.getOrDefault(productId, 0.0) + revenue
                );
            }
        }
        
        // Create report data
        Map<String, Object> reportData = new HashMap<>();
        reportData.put("title", "Sales Report");
        reportData.put("period", startDate + " to " + endDate);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalSales", totalSales);
        summary.put("totalTransactions", totalTransactions);
        summary.put("averageTransactionValue", averageTransactionValue);
        
        reportData.put("summary", summary);
        
        // TODO: Add top products data
        
        return reportData;
    }
    
    public Map<String, Object> generateInventoryReport() {
        List<Inventory> allInventory = inventoryService.getAllInventory();
        List<Inventory> lowStockItems = inventoryService.getLowStockItems();
        
        int totalItems = allInventory.stream()
            .mapToInt(Inventory::getCurrentQuantity)
            .sum();
        
        int lowStockCount = lowStockItems.size();
        
        int outOfStockCount = (int) allInventory.stream()
            .filter(item -> item.getCurrentQuantity() == 0)
            .count();
        
        // Calculate inventory value (assuming we have product prices)
        double inventoryValue = 0.0; // This would require product prices
        
        // Create report data
        Map<String, Object> reportData = new HashMap<>();
        reportData.put("title", "Inventory Report");
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalItems", totalItems);
        summary.put("lowStockItems", lowStockCount);
        summary.put("outOfStockItems", outOfStockCount);
        summary.put("inventoryValue", inventoryValue);
        
        reportData.put("summary", summary);
        reportData.put("lowStockProducts", lowStockItems);
        
        return reportData;
    }
}
