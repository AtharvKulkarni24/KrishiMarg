package com.krishimarg.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public class AcceptRouteRequest {

    @JsonProperty("driver_id")
    @JsonAlias({"driverId", "driver_id"})
    private String driverId;

    public AcceptRouteRequest() {
    }

    public AcceptRouteRequest(String driverId) {
        this.driverId = driverId;
    }

    public String getDriverId() {
        return driverId;
    }

    public void setDriverId(String driverId) {
        this.driverId = driverId;
    }
}
