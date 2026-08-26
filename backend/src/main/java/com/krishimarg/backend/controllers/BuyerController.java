package com.krishimarg.backend.controllers;

import com.krishimarg.backend.models.Order;
import com.krishimarg.backend.models.ProduceLot;
import com.krishimarg.backend.repositories.OrderRepository;
import com.krishimarg.backend.repositories.ProduceLotRepository;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class BuyerController {

    @Autowired
    private ProduceLotRepository produceLotRepository;
    
    @Autowired
    private OrderRepository orderRepository;

    private final GeometryFactory geometryFactory = new GeometryFactory();

    @GetMapping("/buyer/search")
    public ResponseEntity<Map<String, Object>> searchProduce(
            @RequestParam(required = false) String crop,
            @RequestParam(required = false) String lat,
            @RequestParam(required = false) String lng,
            @RequestParam(required = false) String radius_km) {
            
        try {
            if (crop == null || lat == null || lng == null || radius_km == null) {
                return ResponseEntity.badRequest().body(Map.of("error", true, "message", "Missing query parameters: crop, lat, lng, radius_km"));
            }
            
            double latitude = Double.parseDouble(lat);
            double longitude = Double.parseDouble(lng);
            double radiusMeters = Double.parseDouble(radius_km) * 1000;
            
            List<ProduceLot> lots = produceLotRepository.findNearbyAvailableProduce(crop, latitude, longitude, radiusMeters);
            
            List<Map<String, Object>> lotResponses = new ArrayList<>();
            for (ProduceLot lot : lots) {
                Map<String, Object> map = new HashMap<>();
                map.put("lot_id", lot.getLotId());
                map.put("farmer_id", lot.getFarmerId());
                map.put("crop_name", lot.getCropName());
                map.put("quantity_kg", lot.getQuantityKg());
                map.put("price_per_kg", lot.getPricePerKg());
                map.put("harvest_date", lot.getHarvestDate());
                map.put("latitude", lot.getFarmLocation().getY()); 
                map.put("longitude", lot.getFarmLocation().getX()); 
                lotResponses.add(map);
            }
            return ResponseEntity.ok(Map.of("available_lots", lotResponses));
            
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", true, "message", "Coordinates and radius must be valid numbers."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", true, "message", "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/orders")
    public ResponseEntity<Map<String, Object>> checkout(@RequestBody Map<String, Object> payload) {
        try {
            if (!payload.containsKey("buyer_id") || !payload.containsKey("lot_ids") || 
                !payload.containsKey("dropoff_latitude") || !payload.containsKey("dropoff_longitude")) {
                return ResponseEntity.badRequest().body(Map.of("error", true, "message", "Missing required fields for checkout."));
            }
            
            Object lotIdsObj = payload.get("lot_ids");
            if (!(lotIdsObj instanceof List)) {
                return ResponseEntity.badRequest().body(Map.of("error", true, "message", "lot_ids must be a JSON array."));
            }
            List<String> lotIds = (List<String>) lotIdsObj;
            
            Order order = new Order();
            String orderId = "ord_" + UUID.randomUUID().toString().substring(0, 5);
            order.setOrderId(orderId);
            order.setBuyerId(payload.get("buyer_id").toString());
            order.setLotIds(lotIds);
            
            // Mocking total amount calculation
            order.setTotalAmount(new java.math.BigDecimal("9250.00"));
            
            double lat = Double.parseDouble(payload.get("dropoff_latitude").toString());
            double lng = Double.parseDouble(payload.get("dropoff_longitude").toString());
            org.locationtech.jts.geom.Point point = geometryFactory.createPoint(new Coordinate(lng, lat));
            point.setSRID(4326);
            order.setDropoffLocation(point);
            
            order.setStatus("PENDING_ROUTE");
            orderRepository.save(order);
            
            // Mark lots as sold
            for(String lotId : lotIds) {
                produceLotRepository.findById(lotId).ifPresent(lot -> {
                    lot.setStatus("SOLD");
                    produceLotRepository.save(lot);
                });
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "order_id", orderId,
                    "status", "PENDING_ROUTE",
                    "payment_status", "MOCK_SUCCESS",
                    "total_amount", order.getTotalAmount()
            ));
            
        } catch (NumberFormatException | ClassCastException e) {
            return ResponseEntity.badRequest().body(Map.of("error", true, "message", "Invalid format for coordinates or lot_ids."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", true, "message", "Failed to process order: " + e.getMessage()));
        }
    }
}
