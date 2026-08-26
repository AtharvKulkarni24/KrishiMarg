package com.krishimarg.backend.models;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Entity
@Table(name = "delivery_routes")
public class DeliveryRoute {
    @Id
    private String routeId;
    
    @Column(name = "driver_id")
    private String driverId;
    
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> routeCoordinates;
    
    private String status;

    public DeliveryRoute() {}

    // Getters and Setters
    public String getRouteId() { return routeId; }
    public void setRouteId(String routeId) { this.routeId = routeId; }

    public String getDriverId() { return driverId; }
    public void setDriverId(String driverId) { this.driverId = driverId; }

    public Map<String, Object> getRouteCoordinates() { return routeCoordinates; }
    public void setRouteCoordinates(Map<String, Object> routeCoordinates) { this.routeCoordinates = routeCoordinates; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
