package com.krishimarg.backend.order.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    public static final String STATUS_PENDING_ROUTE = "PENDING_ROUTE";
    public static final String STATUS_ROUTE_ASSIGNED = "ROUTE_ASSIGNED";
    public static final String STATUS_DELIVERED = "DELIVERED";

    @Id
    @Column(name = "order_id", length = 50)
    private String orderId;

    @Column(name = "buyer_id", length = 50, nullable = false)
    private String buyerId;

    @Column(name = "lot_ids", columnDefinition = "TEXT")
    private String lotIds; // JSON string or comma-separated lot IDs

    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "dropoff_latitude")
    private Double dropoffLatitude;

    @Column(name = "dropoff_longitude")
    private Double dropoffLongitude;

    @Column(name = "status", length = 30)
    private String status = STATUS_PENDING_ROUTE;

    @Column(name = "route_id", length = 50)
    private String routeId;

    @Column(name = "payment_status", length = 30)
    private String paymentStatus = "PENDING";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Order() {
    }

    public Order(String orderId, String buyerId, String lotIds, BigDecimal totalAmount,
                 Double dropoffLatitude, Double dropoffLongitude, String status) {
        this.orderId = orderId;
        this.buyerId = buyerId;
        this.lotIds = lotIds;
        this.totalAmount = totalAmount;
        this.dropoffLatitude = dropoffLatitude;
        this.dropoffLongitude = dropoffLongitude;
        this.status = status != null ? status : STATUS_PENDING_ROUTE;
        this.paymentStatus = "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getBuyerId() {
        return buyerId;
    }

    public void setBuyerId(String buyerId) {
        this.buyerId = buyerId;
    }

    public String getLotIds() {
        return lotIds;
    }

    public void setLotIds(String lotIds) {
        this.lotIds = lotIds;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Double getDropoffLatitude() {
        return dropoffLatitude;
    }

    public void setDropoffLatitude(Double dropoffLatitude) {
        this.dropoffLatitude = dropoffLatitude;
    }

    public Double getDropoffLongitude() {
        return dropoffLongitude;
    }

    public void setDropoffLongitude(Double dropoffLongitude) {
        this.dropoffLongitude = dropoffLongitude;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRouteId() {
        return routeId;
    }

    public void setRouteId(String routeId) {
        this.routeId = routeId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
}
