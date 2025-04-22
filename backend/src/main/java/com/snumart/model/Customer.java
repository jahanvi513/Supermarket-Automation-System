package com.snumart.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "customers")
@Data
public class Customer {
    @Id
    private String id;
    private String name;
    private String email;
    private String phone;
    private int loyaltyPoints;
    private double creditBalance;
    
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "customer")
    private List<PurchaseHistory> purchaseHistory;
}
