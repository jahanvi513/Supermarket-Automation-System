package com.snumart.supermarket.model;

import javax.persistence.*;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "promotions")
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @Column(nullable = false)
    private String discountType; // percentage or fixed

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    @Column
    private Boolean applicableToAll;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Column
    private String category;

    @Column
    private Date startDate;

    @Column
    private Date endDate;

    @Column(nullable = false)
    private Boolean isActive;

    public Promotion() {
    }

    public Promotion(String name, String description, String discountType, BigDecimal discountValue, Boolean isActive) {
        this.name = name;
        this.description = description;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.isActive = isActive;
        this.applicableToAll = false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDiscountType() {
        return discountType;
    }

    public void setDiscountType(String discountType) {
        this.discountType = discountType;
    }

    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public Boolean getApplicableToAll() {
        return applicableToAll;
    }

    public void setApplicableToAll(Boolean applicableToAll) {
        this.applicableToAll = applicableToAll;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
