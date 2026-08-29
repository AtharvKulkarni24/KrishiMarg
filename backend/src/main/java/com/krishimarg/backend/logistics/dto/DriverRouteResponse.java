package com.krishimarg.backend.logistics.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class DriverRouteResponse {

    private String routeId;
    private String driverId;
    private String status;
    private Double totalDistanceKm;
    private Integer pickupCount;
    private Integer dropoffCount;
    private BigDecimal estimatedPayout;
    private List<RouteCoordinate> routeCoordinates;
    private List<OrderedStopDto> orderedStops;

    public DriverRouteResponse() {
    }

    public DriverRouteResponse(String routeId, String driverId, String status,
                               Double totalDistanceKm, Integer pickupCount,
                               Integer dropoffCount, BigDecimal estimatedPayout,
                               List<RouteCoordinate> routeCoordinates,
                               List<OrderedStopDto> orderedStops) {
        this.routeId = routeId;
        this.driverId = driverId;
        this.status = status;
        this.totalDistanceKm = totalDistanceKm;
        this.pickupCount = pickupCount;
        this.dropoffCount = dropoffCount;
        this.estimatedPayout = estimatedPayout;
        this.routeCoordinates = routeCoordinates;
        this.orderedStops = orderedStops;
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

    public BigDecimal getEstimatedPayout() {
        return estimatedPayout;
    }

    public void setEstimatedPayout(BigDecimal estimatedPayout) {
        this.estimatedPayout = estimatedPayout;
    }

    public List<RouteCoordinate> getRouteCoordinates() {
        return routeCoordinates;
    }

    public void setRouteCoordinates(List<RouteCoordinate> routeCoordinates) {
        this.routeCoordinates = routeCoordinates;
    }

    public List<OrderedStopDto> getOrderedStops() {
        return orderedStops;
    }

    public void setOrderedStops(List<OrderedStopDto> orderedStops) {
        this.orderedStops = orderedStops;
    }
}
