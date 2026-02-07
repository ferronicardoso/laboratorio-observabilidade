package com.observability.api.model;

import java.time.LocalDateTime;
import java.util.List;

public class Order {
    private Long id;
    private String customerName;
    private List<Long> productIds;
    private Double totalAmount;
    private String status; // PENDING, PROCESSING, COMPLETED, CANCELLED
    private LocalDateTime createdAt;

    public Order() {
    }

    public Order(Long id, String customerName, List<Long> productIds, Double totalAmount) {
        this.id = id;
        this.customerName = customerName;
        this.productIds = productIds;
        this.totalAmount = totalAmount;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public List<Long> getProductIds() { return productIds; }
    public void setProductIds(List<Long> productIds) { this.productIds = productIds; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
