package com.krishimarg.backend.dto;

import java.util.List;

public class CreateOrderRequest {
    private String buyerId;
    private List<String> lotIds;
    private Double dropoffLatitude;
    private Double dropoffLongitude;

    public CreateOrderRequest() {
    }

    public String getBuyerId() {
        return buyerId;
    }

    public void setBuyerId(String buyerId) {
        this.buyerId = buyerId;
    }

    public List<String> getLotIds() {
        return lotIds;
    }

    public void setLotIds(List<String> lotIds) {
        this.lotIds = lotIds;
    }

    public Double getDropoffLatitude() {
        return dropoffLatitude;
    }

    public void setDropoffLatitude(Double dropoffLatitude) {
        this.dropoffLatitude = dropoffLatitude;
    }

    public Double getDropoffLongitude() {
        return dropoffLongitude;
    }

    public void setDropoffLongitude(Double dropoffLongitude) {
        this.dropoffLongitude = dropoffLongitude;
    }
}
