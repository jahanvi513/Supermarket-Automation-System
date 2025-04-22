package com.snumart.controller;

import com.snumart.model.Inventory;
import com.snumart.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    @Autowired
    private InventoryService inventoryService;
    
    @GetMapping
    public List<Inventory> getAllInventory() {
        return inventoryService.getAllInventory();
    }
    
    @GetMapping("/{productId}")
    public ResponseEntity<?> getInventoryByProductId(@PathVariable String productId) {
        return inventoryService.getInventoryByProductId(productId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/low-stock")
    public List<Inventory> getLowStockItems() {
        return inventoryService.getLowStockItems();
    }
    
    @GetMapping("/status/{status}")
    public List<Inventory> getItemsByReorderStatus(@PathVariable String status) {
        return inventoryService.getItemsByReorderStatus(status);
    }
    
    @PutMapping("/{productId}")
    public ResponseEntity<?> updateInventory(@PathVariable String productId, @RequestBody Inventory inventory) {
        return inventoryService.getInventoryByProductId(productId)
            .map(existingInventory -> {
                inventory.setProductId(productId);
                Inventory updatedInventory = inventoryService.updateInventory(inventory);
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "item", updatedInventory
                ));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
