package com.krishimarg.backend.models;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Point;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    private String orderId;
    
    @Column(name = "buyer_id")
    private String buyerId;
    
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> lotIds;
    
    private BigDecimal totalAmount;
    
    @Column(columnDefinition = "geometry(Point,4326)")
    private Point dropoffLocation;
    
    private String status;

    public Order() {}

    // Getters and Setters
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getBuyerId() { return buyerId; }
    public void setBuyerId(String buyerId) { this.buyerId = buyerId; }

    public List<String> getLotIds() { return lotIds; }
    public void setLotIds(List<String> lotIds) { this.lotIds = lotIds; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public Point getDropoffLocation() { return dropoffLocation; }
    public void setDropoffLocation(Point dropoffLocation) { this.dropoffLocation = dropoffLocation; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
