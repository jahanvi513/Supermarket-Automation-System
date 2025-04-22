package com.snumart.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.ElementCollection;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "store_sections")
@Data
public class StoreSection {
    @Id
    private String id;
    private String name;
    
    @ElementCollection
    private List<String> products;
}
