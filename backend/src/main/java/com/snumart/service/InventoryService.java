package com.snumart.service;

import com.snumart.model.Inventory;
import com.snumart.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {
    @Autowired
    private InventoryRepository inventoryRepository;
    
    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }
    
    public Optional<Inventory> getInventoryByProductId(String productId) {
        return inventoryRepository.findById(productId);
    }
    
    public List<Inventory> getLowStockItems() {
        return inventoryRepository.findByCurrentQuantityLessThanMinimumThreshold();
    }
    
    public List<Inventory> getItemsByReorderStatus(String status) {
        return inventoryRepository.findByReorderStatus(status);
    }
    
    public Inventory updateInventory(Inventory inventory) {
        // Check if inventory needs reordering
        if (inventory.getCurrentQuantity() < inventory.getMinimumThreshold()) {
            inventory.setReorderStatus("Reorder Needed");
        } else {
            inventory.setReorderStatus("Normal");
        }
        
        return inventoryRepository.save(inventory);
    }
    
    public void updateInventoryAfterSale(String productId, int quantity) {
        Optional<Inventory> inventoryOpt = inventoryRepository.findById(productId);
        
        if (inventoryOpt.isPresent()) {
            Inventory inventory = inventoryOpt.get();
            int newQuantity = inventory.getCurrentQuantity() - quantity;
            
            // Ensure quantity doesn't go below 0
            inventory.setCurrentQuantity(Math.max(0, newQuantity));
            
            // Update reorder status
            if (inventory.getCurrentQuantity() < inventory.getMinimumThreshold()) {
                inventory.setReorderStatus("Reorder Needed");
            }
            
            inventoryRepository.save(inventory);
        }
    }
}
