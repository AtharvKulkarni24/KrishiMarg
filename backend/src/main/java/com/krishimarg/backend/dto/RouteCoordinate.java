package com.krishimarg.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import tools.jackson.core.JacksonException;
import tools.jackson.core.JsonParser;
import tools.jackson.core.JsonToken;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ValueDeserializer;
import tools.jackson.databind.annotation.JsonDeserialize;

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

    @JsonProperty("lat")
    public Double getLat() {
        return latitude;
    }

    @JsonProperty("lng")
    public Double getLng() {
        return longitude;
    }

    public static class RouteCoordinateDeserializer extends ValueDeserializer<RouteCoordinate> {
        @Override
        public RouteCoordinate deserialize(JsonParser p, DeserializationContext ctxt) throws JacksonException {
            if (p.currentToken() == JsonToken.START_ARRAY) {
                JsonNode arrayNode = p.readValueAsTree();
                if (arrayNode != null && arrayNode.size() >= 2) {
                    double lat = arrayNode.get(0).asDouble();
                    double lng = arrayNode.get(1).asDouble();
                    return new RouteCoordinate(lat, lng);
                }
                return new RouteCoordinate(0.0, 0.0);
            } else if (p.currentToken() == JsonToken.START_OBJECT) {
                JsonNode node = p.readValueAsTree();
                double lat = 0.0;
                double lng = 0.0;
                if (node.has("latitude")) {
                    lat = node.get("latitude").asDouble();
                } else if (node.has("lat")) {
                    lat = node.get("lat").asDouble();
                }

                if (node.has("longitude")) {
                    lng = node.get("longitude").asDouble();
                } else if (node.has("lng")) {
                    lng = node.get("lng").asDouble();
                } else if (node.has("lon")) {
                    lng = node.get("lon").asDouble();
                }
                return new RouteCoordinate(lat, lng);
            }
            return new RouteCoordinate(0.0, 0.0);
        }
    }
}
