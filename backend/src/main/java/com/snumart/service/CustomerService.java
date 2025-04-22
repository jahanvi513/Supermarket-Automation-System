package com.snumart.service;

import com.snumart.model.Customer;
import com.snumart.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {
    @Autowired
    private CustomerRepository customerRepository;
    
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }
    
    public Optional<Customer> getCustomerById(String id) {
        return customerRepository.findById(id);
    }
    
    public List<Customer> searchCustomers(String query) {
        return customerRepository.findByNameContainingIgnoreCase(query);
    }
    
    public List<Customer> getCustomersWithLoyaltyPoints(int minPoints) {
        return customerRepository.findByLoyaltyPointsGreaterThan(minPoints);
    }
    
    public Customer saveCustomer(Customer customer) {
        return customerRepository.save(customer);
    }
    
    public void updateLoyaltyPoints(String customerId, double purchaseAmount) {
        Optional<Customer> customerOpt = customerRepository.findById(customerId);
        
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            
            // Add 1 loyalty point for every $10 spent
            int pointsToAdd = (int) (purchaseAmount / 10);
            customer.setLoyaltyPoints(customer.getLoyaltyPoints() + pointsToAdd);
            
            customerRepository.save(customer);
        }
    }
    
    public boolean usePurchaseCredit(String customerId, double amount) {
        Optional<Customer> customerOpt = customerRepository.findById(customerId);
        
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            
            if (customer.getCreditBalance() >= amount) {
                customer.setCreditBalance(customer.getCreditBalance() - amount);
                customerRepository.save(customer);
                return true;
            }
        }
        
        return false;
    }
    
    public void addPurchaseCredit(String customerId, double amount) {
        Optional<Customer> customerOpt = customerRepository.findById(customerId);
        
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            customer.setCreditBalance(customer.getCreditBalance() + amount);
            customerRepository.save(customer);
        }
    }
}
