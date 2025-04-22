package com.snumart.supermarket.model;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer currentQuantity;

    @Column(nullable = false)
    private Integer minimumThreshold;

    @Column
    private Integer maximumCapacity;

    @Column
    private Date lastRestockDate;

    @Column
    private Date reorderDate;

    @Column
    private String reorderStatus;

    @Column
    private Boolean notifyIfLowStock;

    public Inventory() {
    }

    public Inventory(Product product, Integer currentQuantity, Integer minimumThreshold, Integer maximumCapacity) {
        this.product = product;
        this.currentQuantity = currentQuantity;
        this.minimumThreshold = minimumThreshold;
        this.maximumCapacity = maximumCapacity;
        this.notifyIfLowStock = true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getCurrentQuantity() {
        return currentQuantity;
    }

    public void setCurrentQuantity(Integer currentQuantity) {
        this.currentQuantity = currentQuantity;
    }

    public Integer getMinimumThreshold() {
        return minimumThreshold;
    }

    public void setMinimumThreshold(Integer minimumThreshold) {
        this.minimumThreshold = minimumThreshold;
    }

    public Integer getMaximumCapacity() {
        return maximumCapacity;
    }

    public void setMaximumCapacity(Integer maximumCapacity) {
        this.maximumCapacity = maximumCapacity;
    }

    public Date getLastRestockDate() {
        return lastRestockDate;
    }

    public void setLastRestockDate(Date lastRestockDate) {
        this.lastRestockDate = lastRestockDate;
    }

    public Date getReorderDate() {
        return reorderDate;
    }

    public void setReorderDate(Date reorderDate) {
        this.reorderDate = reorderDate;
    }

    public String getReorderStatus() {
        return reorderStatus;
    }

    public void setReorderStatus(String reorderStatus) {
        this.reorderStatus = reorderStatus;
    }

    public Boolean getNotifyIfLowStock() {
        return notifyIfLowStock;
    }

    public void setNotifyIfLowStock(Boolean notifyIfLowStock) {
        this.notifyIfLowStock = notifyIfLowStock;
    }
}
