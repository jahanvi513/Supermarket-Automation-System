package com.snumart.service;

import com.snumart.model.Invoice;
import com.snumart.model.InvoiceItem;
import com.snumart.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class InvoiceService {
    @Autowired
    private InvoiceRepository invoiceRepository;
    
    @Autowired
    private InventoryService inventoryService;
    
    @Autowired
    private CustomerService customerService;
    
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }
    
    public Optional<Invoice> getInvoiceById(String id) {
        return invoiceRepository.findById(id);
    }
    
    public List<Invoice> getInvoicesByCustomer(String customerId) {
        return invoiceRepository.findByCustomerId(customerId);
    }
    
    public List<Invoice> getInvoicesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return invoiceRepository.findByDateBetween(startDate, endDate);
    }
    
    public Invoice createInvoice(Invoice invoice) {
        // Set the current date and time
        invoice.setDate(LocalDateTime.now());
        
        // Save the invoice
        Invoice savedInvoice = invoiceRepository.save(invoice);
        
        // Update inventory for each item
        for (InvoiceItem item : invoice.getItems()) {
            inventoryService.updateInventoryAfterSale(item.getProductId(), item.getQuantity());
        }
        
        // Update customer loyalty points if customer is provided
        if (invoice.getCustomerId() != null && !invoice.getCustomerId().equals("guest")) {
            customerService.updateLoyaltyPoints(invoice.getCustomerId(), invoice.getTotal());
        }
        
        return savedInvoice;
    }
}
