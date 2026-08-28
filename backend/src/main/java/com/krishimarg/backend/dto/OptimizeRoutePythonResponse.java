package com.krishimarg.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

public class OptimizeRoutePythonResponse {

    @JsonProperty("route_id")
    @JsonAlias({"routeId", "route_id"})
    private String routeId;

    @JsonProperty("total_distance_km")
    @JsonAlias({"totalDistanceKm", "total_distance_km", "distance_km"})
    private Double totalDistanceKm;

    @JsonProperty("route_coordinates")
    @JsonAlias({"routeCoordinates", "route_coordinates", "coordinates"})
    private List<RouteCoordinate> routeCoordinates = new ArrayList<>();

    @JsonProperty("ordered_stops")
    @JsonAlias({"orderedStops", "ordered_stops", "stops"})
    private List<OrderedStopDto> orderedStops = new ArrayList<>();

    public OptimizeRoutePythonResponse() {
    }

    public OptimizeRoutePythonResponse(String routeId, Double totalDistanceKm,
                                       List<RouteCoordinate> routeCoordinates,
                                       List<OrderedStopDto> orderedStops) {
        this.routeId = routeId;
        this.totalDistanceKm = totalDistanceKm;
        this.routeCoordinates = routeCoordinates != null ? routeCoordinates : new ArrayList<>();
        this.orderedStops = orderedStops != null ? orderedStops : new ArrayList<>();
    }

    public String getRouteId() {
        return routeId;
    }

    public void setRouteId(String routeId) {
        this.routeId = routeId;
    }

    public Double getTotalDistanceKm() {
        return totalDistanceKm;
    }

    public void setTotalDistanceKm(Double totalDistanceKm) {
        this.totalDistanceKm = totalDistanceKm;
    }

    public List<RouteCoordinate> getRouteCoordinates() {
        return routeCoordinates;
    }

    public void setRouteCoordinates(List<RouteCoordinate> routeCoordinates) {
        this.routeCoordinates = routeCoordinates != null ? routeCoordinates : new ArrayList<>();
    }

    public List<OrderedStopDto> getOrderedStops() {
        return orderedStops;
    }

    public void setOrderedStops(List<OrderedStopDto> orderedStops) {
        this.orderedStops = orderedStops != null ? orderedStops : new ArrayList<>();
    }
}
