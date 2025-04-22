package com.snumart.controller;

import com.snumart.model.StoreSection;
import com.snumart.service.StoreSectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/store/layout")
public class StoreSectionController {
    @Autowired
    private StoreSectionService storeSectionService;
    
    @GetMapping
    public List<StoreSection> getAllSections() {
        return storeSectionService.getAllSections();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getSectionById(@PathVariable String id) {
        return storeSectionService.getSectionById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/find-product")
    public List<StoreSection> findSectionsByProduct(@RequestParam String product) {
        return storeSectionService.findSectionsByProduct(product);
    }
    
    @PostMapping
    public ResponseEntity<?> createSection(@RequestBody StoreSection section) {
        StoreSection savedSection = storeSectionService.saveSection(section);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "section", savedSection
        ));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSection(@PathVariable String id, @RequestBody StoreSection section) {
        return storeSectionService.getSectionById(id)
            .map(existingSection -> {
                section.setId(id);
                StoreSection updatedSection = storeSectionService.saveSection(section);
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "section", updatedSection
                ));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
