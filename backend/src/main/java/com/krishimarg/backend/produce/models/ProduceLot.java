package com.krishimarg.backend.produce.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.locationtech.jts.geom.Point;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "produce_lots")
public class ProduceLot {

    public static final String STATUS_AVAILABLE = "AVAILABLE";
    public static final String STATUS_SOLD = "SOLD";

    @Id
    @Column(name = "lot_id", length = 50)
    private String lotId;

    @Column(name = "farmer_id", length = 50, nullable = false)
    private String farmerId;

    @Column(name = "crop_name", length = 100, nullable = false)
    private String cropName;

    @Column(name = "quantity_kg")
    private Double quantityKg;

    @Column(name = "price_per_kg", precision = 10, scale = 2)
    private BigDecimal pricePerKg;

    @Column(name = "status", length = 30)
    private String status = STATUS_AVAILABLE;

    @Column(name = "location", columnDefinition = "geometry(Point,4326)")
    private Point location;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public ProduceLot() {
    }

    public ProduceLot(String lotId, String farmerId, String cropName, Double quantityKg, BigDecimal pricePerKg, Point location) {
        this.lotId = lotId;
        this.farmerId = farmerId;
        this.cropName = cropName;
        this.quantityKg = quantityKg;
        this.pricePerKg = pricePerKg;
        this.location = location;
        this.status = STATUS_AVAILABLE;
        this.createdAt = LocalDateTime.now();
    }

    public String getLotId() {
        return lotId;
    }

    public void setLotId(String lotId) {
        this.lotId = lotId;
    }

    public String getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(String farmerId) {
        this.farmerId = farmerId;
    }

    public String getCropName() {
        return cropName;
    }

    public void setCropName(String cropName) {
        this.cropName = cropName;
    }

    public Double getQuantityKg() {
        return quantityKg;
    }

    public void setQuantityKg(Double quantityKg) {
        this.quantityKg = quantityKg;
    }

    public BigDecimal getPricePerKg() {
        return pricePerKg;
    }

    public void setPricePerKg(BigDecimal pricePerKg) {
        this.pricePerKg = pricePerKg;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Point getLocation() {
        return location;
    }

    public void setLocation(Point location) {
        this.location = location;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
