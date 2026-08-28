package com.krishimarg.backend.services;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import com.krishimarg.backend.dto.*;
import com.krishimarg.backend.exceptions.InvalidRouteStateException;
import com.krishimarg.backend.exceptions.RouteAlreadyAcceptedException;
import com.krishimarg.backend.exceptions.RouteNotFoundException;
import com.krishimarg.backend.exceptions.RouteOptimizerUnavailableException;
import com.krishimarg.backend.exceptions.UnauthorizedDriverException;
import com.krishimarg.backend.models.DeliveryRoute;
import com.krishimarg.backend.models.Order;
import com.krishimarg.backend.repositories.DeliveryRouteRepository;
import com.krishimarg.backend.repositories.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class LogisticsService {

    private static final Logger log = LoggerFactory.getLogger(LogisticsService.class);

    private final OrderRepository orderRepository;
    private final DeliveryRouteRepository deliveryRouteRepository;
    private final MockEscrowService mockEscrowService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${route.optimizer.url:http://localhost:8000/api/v1/optimize-route}")
    private String optimizerUrl = "http://localhost:8000/api/v1/optimize-route";

    @Value("${logistics.driver.base-fare:200.00}")
    private BigDecimal baseFare = new BigDecimal("200.00");

    @Value("${logistics.driver.per-km-rate:25.00}")
    private BigDecimal perKmRate = new BigDecimal("25.00");

    public LogisticsService(OrderRepository orderRepository,
                            DeliveryRouteRepository deliveryRouteRepository,
                            MockEscrowService mockEscrowService,
                            RestTemplate restTemplate,
                            ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.deliveryRouteRepository = deliveryRouteRepository;
        this.mockEscrowService = mockEscrowService;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Finds all PENDING_ROUTE orders, sends them to Python OR-Tools engine,
     * creates an optimized DeliveryRoute, and marks orders as ROUTE_ASSIGNED.
     */
    @Transactional
    public OptimizeRouteResponse optimizePendingRoutes() {
        // 1. Find all orders whose status is PENDING_ROUTE
        List<Order> pendingOrders = orderRepository.findByStatus(Order.STATUS_PENDING_ROUTE);
        log.info("Number of PENDING_ROUTE orders found: {}", pendingOrders.size());

        // 2. Handle empty order list
        if (pendingOrders.isEmpty()) {
            log.info("No orders pending for route optimization");
            return new OptimizeRouteResponse(true, "No orders pending for route optimization");
        }

        // 3. Collect orders into batch request payload
        List<OptimizeRouteOrderItem> orderItems = new ArrayList<>();
        for (Order order : pendingOrders) {
            List<String> lotIds = parseLotIds(order.getLotIds());
            OptimizeRouteOrderItem item = new OptimizeRouteOrderItem(
                    order.getOrderId(),
                    order.getBuyerId(),
                    order.getDropoffLatitude() != null ? order.getDropoffLatitude() : 18.5204,
                    order.getDropoffLongitude() != null ? order.getDropoffLongitude() : 73.8567,
                    lotIds,
                    order.getTotalAmount()
            );
            orderItems.add(item);
        }

        OptimizeRouteRequest requestPayload = new OptimizeRouteRequest(orderItems);
        log.info("Sending route optimization request to Python OR-Tools at: {}", optimizerUrl);

        // 4. Send the batch to the Python OR-Tools API
        OptimizeRoutePythonResponse pythonResponse;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<OptimizeRouteRequest> entity = new HttpEntity<>(requestPayload, headers);

            ResponseEntity<OptimizeRoutePythonResponse> responseEntity =
                    restTemplate.postForEntity(optimizerUrl, entity, OptimizeRoutePythonResponse.class);

            pythonResponse = responseEntity.getBody();
            if (pythonResponse == null) {
                throw new RouteOptimizerUnavailableException("Invalid response from route optimization engine");
            }
            log.info("Python optimization success: totalDistance={} km, stops={}",
                    pythonResponse.getTotalDistanceKm(),
                    pythonResponse.getOrderedStops() != null ? pythonResponse.getOrderedStops().size() : 0);

        } catch (ResourceAccessException ex) {
            log.error("Python optimization failure (connection/timeout): {}", ex.getMessage());
            throw new RouteOptimizerUnavailableException("Route optimization service is unavailable: " + ex.getMessage(), ex);
        } catch (RestClientException ex) {
            log.error("Python optimization failure: {}", ex.getMessage());
            throw new RouteOptimizerUnavailableException("Route optimization service failed: " + ex.getMessage(), ex);
        } catch (Exception ex) {
            log.error("Unexpected error during route optimization: ", ex);
            throw new RouteOptimizerUnavailableException("Route optimization service is unavailable", ex);
        }

        // 5. Validate coordinates
        List<RouteCoordinate> coords = pythonResponse.getRouteCoordinates();
        if (coords == null || coords.isEmpty()) {
            log.warn("Optimizer returned empty coordinates, generating coordinates from order stops");
            coords = new ArrayList<>();
            for (OptimizeRouteOrderItem item : orderItems) {
                coords.add(new RouteCoordinate(item.getDeliveryLatitude(), item.getDeliveryLongitude()));
            }
        }

        // 6. Generate route ID and save DeliveryRoute entity
        String generatedRouteId = (pythonResponse.getRouteId() != null && !pythonResponse.getRouteId().trim().isEmpty())
                ? pythonResponse.getRouteId()
                : "route_" + System.currentTimeMillis();

        Double totalDistance = pythonResponse.getTotalDistanceKm() != null ? pythonResponse.getTotalDistanceKm() : 15.0;

        // Calculate estimated payout for driver
        BigDecimal estimatedPayout = baseFare.add(perKmRate.multiply(BigDecimal.valueOf(totalDistance)));

        int pickupCount = 0;
        int dropoffCount = orderItems.size();
        if (pythonResponse.getOrderedStops() != null) {
            for (OrderedStopDto stop : pythonResponse.getOrderedStops()) {
                if ("PICKUP".equalsIgnoreCase(stop.getType())) {
                    pickupCount++;
                }
            }
        }
        if (pickupCount == 0) {
            pickupCount = orderItems.size(); // default 1 pickup per order
        }

        String coordsJson = serializeToJson(coords);
        String stopsJson = serializeToJson(pythonResponse.getOrderedStops());

        DeliveryRoute route = new DeliveryRoute(
                generatedRouteId,
                coordsJson,
                DeliveryRoute.STATUS_PENDING_DRIVER,
                totalDistance,
                estimatedPayout,
                stopsJson,
                pickupCount,
                dropoffCount
        );

        DeliveryRoute savedRoute = deliveryRouteRepository.save(route);
        log.info("Route saved: ID={}, status={}, distance={}km, payout=₹{}",
                savedRoute.getRouteId(), savedRoute.getStatus(), savedRoute.getTotalDistanceKm(), savedRoute.getEstimatedPayout());

        // 7. Update related orders from PENDING_ROUTE to ROUTE_ASSIGNED
        for (Order order : pendingOrders) {
            order.setStatus(Order.STATUS_ROUTE_ASSIGNED);
            order.setRouteId(savedRoute.getRouteId());
        }
        orderRepository.saveAll(pendingOrders);
        log.info("Updated {} orders to ROUTE_ASSIGNED (Route ID: {})", pendingOrders.size(), savedRoute.getRouteId());

        return new OptimizeRouteResponse(
                true,
                "Route optimized successfully",
                savedRoute.getRouteId(),
                coords,
                savedRoute.getTotalDistanceKm(),
                pythonResponse.getOrderedStops()
        );
    }

    /**
     * Returns available and pending routes for drivers.
     */
    @Transactional(readOnly = true)
    public List<DriverRouteResponse> getAvailableRoutes(Double lat, Double lng, String driverId) {
        List<String> statuses = Arrays.asList(DeliveryRoute.STATUS_PENDING_DRIVER, DeliveryRoute.STATUS_PENDING);
        List<DeliveryRoute> routes;

        if (driverId != null && !driverId.trim().isEmpty()) {
            routes = deliveryRouteRepository.findByStatusInOrDriverId(statuses, driverId.trim());
        } else {
            routes = deliveryRouteRepository.findByStatusIn(statuses);
        }

        List<DriverRouteResponse> responseList = new ArrayList<>();
        for (DeliveryRoute r : routes) {
            List<RouteCoordinate> coords = deserializeCoordinates(r.getRouteCoordinates());
            List<OrderedStopDto> stops = deserializeStops(r.getOrderedStops());

            DriverRouteResponse dto = new DriverRouteResponse(
                    r.getRouteId(),
                    r.getDriverId(),
                    r.getStatus(),
                    r.getTotalDistanceKm(),
                    r.getPickupCount(),
                    r.getDropoffCount(),
                    r.getEstimatedPayout(),
                    coords,
                    stops
            );
            responseList.add(dto);
        }

        return responseList;
    }

    /**
     * Driver accepts an available route.
     * Prevents race conditions and duplicate acceptances.
     */
    @Transactional
    public RouteActionResponse acceptRoute(String routeId, String driverId) {
        if (routeId == null || routeId.trim().isEmpty()) {
            throw new IllegalArgumentException("Route ID is required");
        }

        String assignedDriver = (driverId != null && !driverId.trim().isEmpty()) ? driverId.trim() : "d_801";

        DeliveryRoute route = deliveryRouteRepository.findById(routeId.trim())
                .orElseThrow(() -> new RouteNotFoundException("Route not found with ID: " + routeId));

        // Check if route is already accepted
        if (DeliveryRoute.STATUS_ACCEPTED.equalsIgnoreCase(route.getStatus())) {
            if (assignedDriver.equalsIgnoreCase(route.getDriverId())) {
                log.info("Driver {} has already accepted route {}", assignedDriver, routeId);
                return new RouteActionResponse(true, "Route is already accepted by you", route.getRouteId(), DeliveryRoute.STATUS_ACCEPTED);
            }
            log.warn("Route {} is already accepted by another driver: {}", routeId, route.getDriverId());
            throw new RouteAlreadyAcceptedException("Route " + routeId + " has already been accepted by another driver");
        }

        // Check if route is in a state other than pending
        if (!DeliveryRoute.STATUS_PENDING_DRIVER.equalsIgnoreCase(route.getStatus())
                && !DeliveryRoute.STATUS_PENDING.equalsIgnoreCase(route.getStatus())) {
            log.warn("Route {} is in invalid state: {}", routeId, route.getStatus());
            throw new InvalidRouteStateException("Route " + routeId + " is not available for acceptance (Status: " + route.getStatus() + ")");
        }

        // Assign driver and update status
        route.setDriverId(assignedDriver);
        route.setStatus(DeliveryRoute.STATUS_ACCEPTED);
        DeliveryRoute savedRoute = deliveryRouteRepository.save(route);

        log.info("Driver accepted route: Driver={}, Route={}", assignedDriver, savedRoute.getRouteId());

        return new RouteActionResponse(
                true,
                "Route accepted successfully",
                savedRoute.getRouteId(),
                savedRoute.getStatus()
        );
    }

    /**
     * Driver completes route and triggers Mock Escrow Release.
     */
    @Transactional
    public RouteActionResponse completeRoute(String routeId, String driverId) {
        if (routeId == null || routeId.trim().isEmpty()) {
            throw new IllegalArgumentException("Route ID is required");
        }

        DeliveryRoute route = deliveryRouteRepository.findById(routeId.trim())
                .orElseThrow(() -> new RouteNotFoundException("Route not found with ID: " + routeId));

        // Verify driver ownership if driverId is supplied
        if (driverId != null && !driverId.trim().isEmpty() && route.getDriverId() != null) {
            if (!route.getDriverId().equalsIgnoreCase(driverId.trim())) {
                log.warn("Unauthorized attempt to complete route {}: Driver {}, Assigned {}",
                        routeId, driverId, route.getDriverId());
                throw new UnauthorizedDriverException("Driver " + driverId + " is not authorized to complete route "
                        + routeId + " assigned to " + route.getDriverId());
            }
        }

        // Verify route is currently accepted
        if (!DeliveryRoute.STATUS_ACCEPTED.equalsIgnoreCase(route.getStatus())) {
            log.warn("Route {} cannot be completed from status {}", routeId, route.getStatus());
            throw new InvalidRouteStateException("Route " + routeId + " cannot be completed because its current status is "
                    + route.getStatus() + " (must be ACCEPTED)");
        }

        // Update route to COMPLETED
        route.setStatus(DeliveryRoute.STATUS_COMPLETED);
        route.setCompletedAt(LocalDateTime.now());
        DeliveryRoute savedRoute = deliveryRouteRepository.save(route);
        log.info("Driver completed route: Driver={}, Route={}", savedRoute.getDriverId(), savedRoute.getRouteId());

        // Update related orders to DELIVERED
        List<Order> orders = orderRepository.findByRouteId(savedRoute.getRouteId());
        for (Order order : orders) {
            order.setStatus(Order.STATUS_DELIVERED);
        }
        orderRepository.saveAll(orders);
        log.info("Updated {} orders to DELIVERED for Route {}", orders.size(), savedRoute.getRouteId());

        // Trigger Mock Escrow Release
        String escrowResult = mockEscrowService.releaseEscrow(savedRoute, orders);
        log.info("Mock escrow released: {}", escrowResult);

        return new RouteActionResponse(
                true,
                "Route completed and mock escrow released",
                savedRoute.getRouteId(),
                savedRoute.getStatus(),
                "MOCK_ESCROW_RELEASED"
        );
    }

    private List<String> parseLotIds(String lotIdsStr) {
        if (lotIdsStr == null || lotIdsStr.trim().isEmpty()) {
            return Collections.emptyList();
        }
        try {
            if (lotIdsStr.trim().startsWith("[")) {
                return objectMapper.readValue(lotIdsStr, new TypeReference<List<String>>() {});
            }
            return Arrays.asList(lotIdsStr.split(","));
        } catch (Exception e) {
            return Collections.singletonList(lotIdsStr);
        }
    }

    private String serializeToJson(Object obj) {
        if (obj == null) return "[]";
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.error("Failed to serialize to JSON", e);
            return "[]";
        }
    }

    private List<RouteCoordinate> deserializeCoordinates(String json) {
        if (json == null || json.trim().isEmpty()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<RouteCoordinate>>() {});
        } catch (Exception e) {
            log.error("Failed to deserialize coordinates", e);
            return Collections.emptyList();
        }
    }

    private List<OrderedStopDto> deserializeStops(String json) {
        if (json == null || json.trim().isEmpty()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<OrderedStopDto>>() {});
        } catch (Exception e) {
            log.error("Failed to deserialize stops", e);
            return Collections.emptyList();
        }
    }
}
