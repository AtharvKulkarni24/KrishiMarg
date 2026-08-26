package com.krishimarg.backend.models;

import jakarta.persistence.*;
import org.locationtech.jts.geom.Point;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "produce_lots")
public class ProduceLot {
    @Id
    private String lotId;
    
    @Column(name = "farmer_id")
    private String farmerId;
    
    private String cropName;
    private Integer quantityKg;
    private String qualityGrade;
    private BigDecimal pricePerKg;
    private LocalDate harvestDate;
    private String status;
    
    @Column(columnDefinition = "geometry(Point,4326)")
    private Point farmLocation;

    public ProduceLot() {}

    // Getters and Setters
    public String getLotId() { return lotId; }
    public void setLotId(String lotId) { this.lotId = lotId; }

    public String getFarmerId() { return farmerId; }
    public void setFarmerId(String farmerId) { this.farmerId = farmerId; }

    public String getCropName() { return cropName; }
    public void setCropName(String cropName) { this.cropName = cropName; }

    public Integer getQuantityKg() { return quantityKg; }
    public void setQuantityKg(Integer quantityKg) { this.quantityKg = quantityKg; }

    public String getQualityGrade() { return qualityGrade; }
    public void setQualityGrade(String qualityGrade) { this.qualityGrade = qualityGrade; }

    public BigDecimal getPricePerKg() { return pricePerKg; }
    public void setPricePerKg(BigDecimal pricePerKg) { this.pricePerKg = pricePerKg; }

    public LocalDate getHarvestDate() { return harvestDate; }
    public void setHarvestDate(LocalDate harvestDate) { this.harvestDate = harvestDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Point getFarmLocation() { return farmLocation; }
    public void setFarmLocation(Point farmLocation) { this.farmLocation = farmLocation; }
}
