package com.krishimarg.backend.controllers;

import com.krishimarg.backend.models.DeliveryRoute;
import com.krishimarg.backend.repositories.DeliveryRouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class LogisticsController {

    @Autowired
    private DeliveryRouteRepository routeRepository;

    @GetMapping("/driver/routes")
    public ResponseEntity<Map<String, Object>> getAvailableRoutes(
            @RequestParam(required = false) String lat, 
            @RequestParam(required = false) String lng) {
        
        try {
            if (lat == null || lng == null) {
                return ResponseEntity.badRequest().body(Map.of("error", true, "message", "Missing driver coordinates (lat, lng)."));
            }
            Double.parseDouble(lat); // Quick format validation
            Double.parseDouble(lng);

            List<DeliveryRoute> routes = routeRepository.findByStatus("PENDING_DRIVER");
            
            List<Map<String, Object>> routeList = new ArrayList<>();
            for(DeliveryRoute route : routes) {
                Map<String, Object> map = new HashMap<>();
                map.put("route_id", route.getRouteId());
                map.put("total_distance_km", 42.6); // Mocked
                map.put("pickup_count", 2);
                map.put("dropoff_count", 1);
                map.put("estimated_payout", 1500.00);
                routeList.add(map);
            }
            
            return ResponseEntity.ok(Map.of("available_routes", routeList));
            
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", true, "message", "Coordinates must be valid numbers."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", true, "message", "Failed to fetch routes: " + e.getMessage()));
        }
    }

    @PostMapping("/driver/routes/{routeId}/accept")
    public ResponseEntity<Map<String, Object>> acceptRoute(
            @PathVariable String routeId, 
            @RequestBody Map<String, String> payload) {
            
        try {
            if (!payload.containsKey("driver_id") || payload.get("driver_id").trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", true, "message", "Missing driver_id."));
            }

            Optional<DeliveryRoute> routeOpt = routeRepository.findById(routeId);
            if (routeOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", true, "message", "Route not found."));
            }

            DeliveryRoute route = routeOpt.get();
            route.setDriverId(payload.get("driver_id"));
            route.setStatus("ACCEPTED");
            routeRepository.save(route);
            
            return ResponseEntity.ok(Map.of("status", "ACCEPTED"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", true, "message", "Failed to accept route: " + e.getMessage()));
        }
    }

    @PostMapping("/driver/routes/{routeId}/complete")
    public ResponseEntity<Map<String, Object>> completeRoute(@PathVariable String routeId) {
        try {
            Optional<DeliveryRoute> routeOpt = routeRepository.findById(routeId);
            if (routeOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", true, "message", "Route not found."));
            }

            DeliveryRoute route = routeOpt.get();
            route.setStatus("COMPLETED");
            routeRepository.save(route);
            
            return ResponseEntity.ok(Map.of(
                "status", "COMPLETED",
                "payout_status", "MOCK_ESCROW_RELEASED"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", true, "message", "Failed to complete route: " + e.getMessage()));
        }
    }
}
