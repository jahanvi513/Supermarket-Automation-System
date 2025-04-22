package com.snumart.repository;

import com.snumart.model.StoreSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StoreSectionRepository extends JpaRepository<StoreSection, String> {
    List<StoreSection> findByProductsContaining(String product);
}
