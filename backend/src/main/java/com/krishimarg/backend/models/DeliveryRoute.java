package com.krishimarg.backend.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_routes")
public class DeliveryRoute {

    public static final String STATUS_PENDING_DRIVER = "PENDING_DRIVER";
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_ACCEPTED = "ACCEPTED";
    public static final String STATUS_COMPLETED = "COMPLETED";

    @Id
    @Column(name = "route_id", length = 50)
    private String routeId;

    @Column(name = "driver_id", length = 50)
    private String driverId;

    @Column(name = "route_coordinates", columnDefinition = "TEXT", nullable = false)
    private String routeCoordinates; // JSON array string

    @Column(name = "status", length = 30)
    private String status = STATUS_PENDING_DRIVER;

    @Column(name = "total_distance_km")
    private Double totalDistanceKm;

    @Column(name = "estimated_payout", precision = 10, scale = 2)
    private BigDecimal estimatedPayout;

    @Column(name = "ordered_stops", columnDefinition = "TEXT")
    private String orderedStops; // JSON array of stops

    @Column(name = "pickup_count")
    private Integer pickupCount = 0;

    @Column(name = "dropoff_count")
    private Integer dropoffCount = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public DeliveryRoute() {
    }

    public DeliveryRoute(String routeId, String routeCoordinates, String status,
                         Double totalDistanceKm, BigDecimal estimatedPayout,
                         String orderedStops, Integer pickupCount, Integer dropoffCount) {
        this.routeId = routeId;
        this.routeCoordinates = routeCoordinates;
        this.status = status != null ? status : STATUS_PENDING_DRIVER;
        this.totalDistanceKm = totalDistanceKm;
        this.estimatedPayout = estimatedPayout;
        this.orderedStops = orderedStops;
        this.pickupCount = pickupCount;
        this.dropoffCount = dropoffCount;
        this.createdAt = LocalDateTime.now();
    }

    public String getRouteId() {
        return routeId;
    }

    public void setRouteId(String routeId) {
        this.routeId = routeId;
    }

    public String getDriverId() {
        return driverId;
    }

    public void setDriverId(String driverId) {
        this.driverId = driverId;
    }

    public String getRouteCoordinates() {
        return routeCoordinates;
    }

    public void setRouteCoordinates(String routeCoordinates) {
        this.routeCoordinates = routeCoordinates;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getTotalDistanceKm() {
        return totalDistanceKm;
    }

    public void setTotalDistanceKm(Double totalDistanceKm) {
        this.totalDistanceKm = totalDistanceKm;
    }

    public BigDecimal getEstimatedPayout() {
        return estimatedPayout;
    }

    public void setEstimatedPayout(BigDecimal estimatedPayout) {
        this.estimatedPayout = estimatedPayout;
    }

    public String getOrderedStops() {
        return orderedStops;
    }

    public void setOrderedStops(String orderedStops) {
        this.orderedStops = orderedStops;
    }

    public Integer getPickupCount() {
        return pickupCount;
    }

    public void setPickupCount(Integer pickupCount) {
        this.pickupCount = pickupCount;
    }

    public Integer getDropoffCount() {
        return dropoffCount;
    }

    public void setDropoffCount(Integer dropoffCount) {
        this.dropoffCount = dropoffCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
