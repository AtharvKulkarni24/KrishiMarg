package com.krishimarg.backend.logistics.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public class RouteCoordinate {

    @JsonProperty("latitude")
    @JsonAlias({"lat", "latitude"})
    private Double latitude;

    @JsonProperty("longitude")
    @JsonAlias({"lng", "lon", "longitude"})
    private Double longitude;

    public RouteCoordinate() {
    }

    public RouteCoordinate(Double latitude, Double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}
