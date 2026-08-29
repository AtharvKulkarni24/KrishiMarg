package com.krishimarg.backend.logistics.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class RouteActionResponse {

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

    @JsonProperty("status")
    private String status;

    @JsonProperty("payout_status")
    private String payoutStatus;

    public RouteActionResponse() {
    }

    public RouteActionResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public RouteActionResponse(boolean success, String message, String routeId, String status) {
        this.success = success;
        this.message = message;
        this.routeId = routeId;
        this.status = status;
    }

    public RouteActionResponse(boolean success, String message, String routeId, String status, String payoutStatus) {
        this.success = success;
        this.message = message;
        this.routeId = routeId;
        this.status = status;
        this.payoutStatus = payoutStatus;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPayoutStatus() {
        return payoutStatus;
    }

    public void setPayoutStatus(String payoutStatus) {
        this.payoutStatus = payoutStatus;
    }
}
