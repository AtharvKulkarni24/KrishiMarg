package com.krishimarg.backend.logistics.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.List;

public class OptimizeRouteOrderItem {

    @JsonProperty("order_id")
    private String orderId;

    @JsonProperty("buyer_id")
    private String buyerId;

    @JsonProperty("delivery_latitude")
    private Double deliveryLatitude;

    @JsonProperty("delivery_longitude")
    private Double deliveryLongitude;

    @JsonProperty("lot_ids")
    private List<String> lotIds;

    @JsonProperty("total_amount")
    private BigDecimal totalAmount;

    public OptimizeRouteOrderItem() {
    }

    public OptimizeRouteOrderItem(String orderId, String buyerId, Double deliveryLatitude,
                                  Double deliveryLongitude, List<String> lotIds, BigDecimal totalAmount) {
        this.orderId = orderId;
        this.buyerId = buyerId;
        this.deliveryLatitude = deliveryLatitude;
        this.deliveryLongitude = deliveryLongitude;
        this.lotIds = lotIds;
        this.totalAmount = totalAmount;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getBuyerId() {
        return buyerId;
    }

    public void setBuyerId(String buyerId) {
        this.buyerId = buyerId;
    }

    public Double getDeliveryLatitude() {
        return deliveryLatitude;
    }

    public void setDeliveryLatitude(Double deliveryLatitude) {
        this.deliveryLatitude = deliveryLatitude;
    }

    public Double getDeliveryLongitude() {
        return deliveryLongitude;
    }

    public void setDeliveryLongitude(Double deliveryLongitude) {
        this.deliveryLongitude = deliveryLongitude;
    }

    public List<String> getLotIds() {
        return lotIds;
    }

    public void setLotIds(List<String> lotIds) {
        this.lotIds = lotIds;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}
