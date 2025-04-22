package com.snumart.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "inventory")
@Data
public class Inventory {
    @Id
    private String productId;
    private String productName;
    private int currentQuantity;
    private int minimumThreshold;
    private String reorderStatus;
    private int maximumCapacity;
    private LocalDate lastRestockDate;
}
