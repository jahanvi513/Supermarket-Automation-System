package com.snumart.service;

import com.snumart.model.StoreSection;
import com.snumart.repository.StoreSectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class StoreSectionService {
    @Autowired
    private StoreSectionRepository storeSectionRepository;
    
    public List<StoreSection> getAllSections() {
        return storeSectionRepository.findAll();
    }
    
    public Optional<StoreSection> getSectionById(String id) {
        return storeSectionRepository.findById(id);
    }
    
    public List<StoreSection> findSectionsByProduct(String product) {
        return storeSectionRepository.findByProductsContaining(product);
    }
    
    public StoreSection saveSection(StoreSection section) {
        return storeSectionRepository.save(section);
    }
}
