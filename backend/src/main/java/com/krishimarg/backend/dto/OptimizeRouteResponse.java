package com.krishimarg.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class OptimizeRouteResponse {

    @JsonProperty("success")
    private boolean success;

    @JsonProperty("message")
    private String message;

    @JsonProperty("routeId")
    private String routeId;

    @JsonProperty("route_id")
    public String getRouteIdSnake() {
        return routeId;
    }

    @JsonProperty("routeCoordinates")
    private List<RouteCoordinate> routeCoordinates;

    @JsonProperty("route_coordinates")
    public List<RouteCoordinate> getRouteCoordinatesSnake() {
        return routeCoordinates;
    }

    @JsonProperty("total_distance_km")
    private Double totalDistanceKm;

    @JsonProperty("ordered_stops")
    private List<OrderedStopDto> orderedStops;

    public OptimizeRouteResponse() {
    }

    public OptimizeRouteResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public OptimizeRouteResponse(boolean success, String message, String routeId,
                                 List<RouteCoordinate> routeCoordinates,
                                 Double totalDistanceKm, List<OrderedStopDto> orderedStops) {
        this.success = success;
        this.message = message;
        this.routeId = routeId;
        this.routeCoordinates = routeCoordinates;
        this.totalDistanceKm = totalDistanceKm;
        this.orderedStops = orderedStops;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRouteId() {
        return routeId;
    }

    public void setRouteId(String routeId) {
        this.routeId = routeId;
    }

    public List<RouteCoordinate> getRouteCoordinates() {
        return routeCoordinates;
    }

    public void setRouteCoordinates(List<RouteCoordinate> routeCoordinates) {
        this.routeCoordinates = routeCoordinates;
    }

    public Double getTotalDistanceKm() {
        return totalDistanceKm;
    }

    public void setTotalDistanceKm(Double totalDistanceKm) {
        this.totalDistanceKm = totalDistanceKm;
    }

    public List<OrderedStopDto> getOrderedStops() {
        return orderedStops;
    }

    public void setOrderedStops(List<OrderedStopDto> orderedStops) {
        this.orderedStops = orderedStops;
    }
}
