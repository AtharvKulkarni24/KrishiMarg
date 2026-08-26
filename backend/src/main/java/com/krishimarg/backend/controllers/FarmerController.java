package com.krishimarg.backend.controllers;

import com.krishimarg.backend.models.ProduceLot;
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
public class FarmerController {

    @Autowired
    private ProduceLotRepository produceLotRepository;
    
    private final GeometryFactory geometryFactory = new GeometryFactory();

    @GetMapping("/farmer/insights")
    public ResponseEntity<Map<String, Object>> getInsights(@RequestParam(required = false) String crop) {
        try {
            if (crop == null || crop.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", true, "message", "Missing required query parameter: crop"));
            }

            Map<String, Object> response = new HashMap<>();
            
            Map<String, Object> mandiThresholds = new HashMap<>();
            mandiThresholds.put("current_mandi_price", 15.00);
            mandiThresholds.put("min_price", 12.00);
            mandiThresholds.put("max_price", 25.00);
            
            List<Map<String, Object>> forecast = new ArrayList<>();
            forecast.add(Map.of("date", "2026-08-26", "price", 15.50));
            forecast.add(Map.of("date", "2026-08-27", "price", 16.80));
            forecast.add(Map.of("date", "2026-08-28", "price", 18.20));
            forecast.add(Map.of("date", "2026-08-29", "price", 19.00));
            forecast.add(Map.of("date", "2026-08-30", "price", 17.50));
            
            response.put("mandi_thresholds", mandiThresholds);
            response.put("harvest_suggestion", "Wait 2 days. Prices are expected to rise.");
            response.put("ml_7_day_forecast", forecast);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", true, "message", "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/produce")
    public ResponseEntity<Map<String, Object>> submitProduce(@RequestBody Map<String, Object> payload) {
        try {
            if (!payload.containsKey("farmer_id") || !payload.containsKey("crop_name") || 
                !payload.containsKey("quantity_kg") || !payload.containsKey("price_per_kg") ||
                !payload.containsKey("harvest_date") || !payload.containsKey("latitude") || 
                !payload.containsKey("longitude")) {
                return ResponseEntity.badRequest().body(Map.of("error", true, "message", "Missing required fields in payload."));
            }

            ProduceLot lot = new ProduceLot();
            String lotId = "lot_" + UUID.randomUUID().toString().substring(0, 5);
            lot.setLotId(lotId);
            lot.setFarmerId(payload.get("farmer_id").toString());
            lot.setCropName(payload.get("crop_name").toString());
            lot.setQuantityKg(Integer.parseInt(payload.get("quantity_kg").toString()));
            lot.setPricePerKg(new java.math.BigDecimal(payload.get("price_per_kg").toString()));
            lot.setHarvestDate(java.time.LocalDate.parse(payload.get("harvest_date").toString()));
            lot.setStatus("AVAILABLE");
            
            double lat = Double.parseDouble(payload.get("latitude").toString());
            double lng = Double.parseDouble(payload.get("longitude").toString());
            
            org.locationtech.jts.geom.Point point = geometryFactory.createPoint(new Coordinate(lng, lat));
            point.setSRID(4326);
            lot.setFarmLocation(point);
            
            produceLotRepository.save(lot);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "lot_id", lotId,
                    "status", "LISTED"
            ));
            
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", true, "message", "Invalid numeric format provided for quantities or coordinates."));
        } catch (java.time.format.DateTimeParseException e) {
            return ResponseEntity.badRequest().body(Map.of("error", true, "message", "Invalid date format. Please use YYYY-MM-DD."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", true, "message", "Failed to process listing: " + e.getMessage()));
        }
    }
}
