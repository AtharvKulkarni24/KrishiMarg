package com.krishimarg.backend.logistics.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderedStopDto {

    @JsonProperty("type")
    private String type; // 'PICKUP' or 'DROPOFF'

    @JsonProperty("lot_id")
    @JsonAlias({"lotId", "lot_id"})
    private String lotId;

    @JsonProperty("order_id")
    @JsonAlias({"orderId", "order_id"})
    private String orderId;

    @JsonProperty("latitude")
    @JsonAlias({"lat", "latitude"})
    private Double latitude;

    @JsonProperty("longitude")
    @JsonAlias({"lng", "longitude"})
    private Double longitude;

    public OrderedStopDto() {
    }

    public OrderedStopDto(String type, String lotId, String orderId, Double latitude, Double longitude) {
        this.type = type;
        this.lotId = lotId;
        this.orderId = orderId;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getLotId() {
        return lotId;
    }

    public void setLotId(String lotId) {
        this.lotId = lotId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
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
