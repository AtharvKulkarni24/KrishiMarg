package com.krishimarg.backend.logistics.controllers;

import com.krishimarg.backend.logistics.dto.OptimizeRouteResponse;
import com.krishimarg.backend.logistics.services.LogisticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/logistics")
public class LogisticsController {

    private static final Logger log = LoggerFactory.getLogger(LogisticsController.class);

    private final LogisticsService logisticsService;

    public LogisticsController(LogisticsService logisticsService) {
        this.logisticsService = logisticsService;
    }

    /**
     * Triggers route optimization for all PENDING_ROUTE orders.
     * Batches orders, calls Python OR-Tools API, creates DeliveryRoute,
     * updates order statuses, and returns the optimized route details.
     */
    @PostMapping("/optimize-route")
    public ResponseEntity<OptimizeRouteResponse> optimizeRoute() {
        log.info("Received request to optimize pending routes");
        OptimizeRouteResponse response = logisticsService.optimizePendingRoutes();
        return ResponseEntity.ok(response);
    }
}
