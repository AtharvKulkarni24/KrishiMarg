package com.krishimarg.backend.logistics.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class OptimizeRouteRequest {

    @JsonProperty("orders")
    private List<OptimizeRouteOrderItem> orders;

    public OptimizeRouteRequest() {
    }

    public OptimizeRouteRequest(List<OptimizeRouteOrderItem> orders) {
        this.orders = orders;
    }

    public List<OptimizeRouteOrderItem> getOrders() {
        return orders;
    }

    public void setOrders(List<OptimizeRouteOrderItem> orders) {
        this.orders = orders;
    }
}
