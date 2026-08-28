package com.krishimarg.backend.controllers;

import com.krishimarg.backend.dto.AcceptRouteRequest;
import com.krishimarg.backend.dto.DriverRouteResponse;
import com.krishimarg.backend.dto.RouteActionResponse;
import com.krishimarg.backend.services.LogisticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/driver/routes")
public class DriverController {

    private static final Logger log = LoggerFactory.getLogger(DriverController.class);

    private final LogisticsService logisticsService;

    public DriverController(LogisticsService logisticsService) {
        this.logisticsService = logisticsService;
    }

    /**
     * Returns available and pending routes for drivers.
     * Supports optional location filters and driver ID.
     */
    @GetMapping
    public ResponseEntity<List<DriverRouteResponse>> getAvailableRoutes(
            @RequestParam(name = "lat", required = false) Double lat,
            @RequestParam(name = "lng", required = false) Double lng,
            @RequestParam(name = "driver_id", required = false) String driverId) {
        log.info("Driver fetching available routes (lat={}, lng={}, driver_id={})", lat, lng, driverId);
        List<DriverRouteResponse> routes = logisticsService.getAvailableRoutes(lat, lng, driverId);
        return ResponseEntity.ok(routes);
    }

    /**
     * Driver accepts an available route.
     * Prevents race conditions / duplicate acceptances.
     */
    @PostMapping("/{routeId}/accept")
    public ResponseEntity<RouteActionResponse> acceptRoute(
            @PathVariable("routeId") String routeId,
            @RequestBody(required = false) AcceptRouteRequest request) {
        String driverId = (request != null && request.getDriverId() != null) ? request.getDriverId() : "d_801";
        log.info("Driver {} attempting to accept route {}", driverId, routeId);
        RouteActionResponse response = logisticsService.acceptRoute(routeId, driverId);
        return ResponseEntity.ok(response);
    }

    /**
     * Driver completes a route, triggering order delivery updates and mock escrow release.
     */
    @PostMapping("/{routeId}/complete")
    public ResponseEntity<RouteActionResponse> completeRoute(
            @PathVariable("routeId") String routeId,
            @RequestBody(required = false) AcceptRouteRequest request,
            @RequestParam(name = "driver_id", required = false) String driverIdParam) {
        String driverId = null;
        if (request != null && request.getDriverId() != null) {
            driverId = request.getDriverId();
        } else if (driverIdParam != null) {
            driverId = driverIdParam;
        }

        log.info("Attempting to complete route {} by driver {}", routeId, driverId);
        RouteActionResponse response = logisticsService.completeRoute(routeId, driverId);
        return ResponseEntity.ok(response);
    }
}
