package com.snumart.repository;

import com.snumart.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, String> {
    List<Inventory> findByCurrentQuantityLessThanMinimumThreshold();
    List<Inventory> findByReorderStatus(String status);
}
