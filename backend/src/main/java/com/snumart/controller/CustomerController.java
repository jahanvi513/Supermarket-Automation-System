package com.snumart.controller;

import com.snumart.model.Customer;
import com.snumart.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    @Autowired
    private CustomerService customerService;
    
    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomerById(@PathVariable String id) {
        return customerService.getCustomerById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public List<Customer> searchCustomers(@RequestParam String query) {
        return customerService.searchCustomers(query);
    }
    
    @GetMapping("/loyalty")
    public List<Customer> getCustomersWithLoyaltyPoints(@RequestParam int minPoints) {
        return customerService.getCustomersWithLoyaltyPoints(minPoints);
    }
    
    @PostMapping  {
        return customerService.getCustomersWithLoyaltyPoints(minPoints);
    }
    
    @PostMapping
    public ResponseEntity<?> createCustomer(@RequestBody Customer customer) {
        Customer savedCustomer = customerService.saveCustomer(customer);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "customer", savedCustomer
        ));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable String id, @RequestBody Customer customer) {
        return customerService.getCustomerById(id)
            .map(existingCustomer -> {
                customer.setId(id);
                Customer updatedCustomer = customerService.saveCustomer(customer);
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "customer", updatedCustomer
                ));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/{id}/credit")
    public ResponseEntity<?> addPurchaseCredit(@PathVariable String id, @RequestBody Map<String, Double> request) {
        Double amount = request.get("amount");
        
        if (amount == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Amount is required"
            ));
        }
        
        return customerService.getCustomerById(id)
            .map(customer -> {
                customerService.addPurchaseCredit(id, amount);
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Purchase credit added successfully"
                ));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/{id}/use-credit")
    public ResponseEntity<?> usePurchaseCredit(@PathVariable String id, @RequestBody Map<String, Double> request) {
        Double amount = request.get("amount");
        
        if (amount == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Amount is required"
            ));
        }
        
        boolean success = customerService.usePurchaseCredit(id, amount);
        
        if (success) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Purchase credit used successfully"
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Insufficient credit balance"
            ));
        }
    }
}
