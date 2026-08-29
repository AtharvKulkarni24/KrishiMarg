package com.krishimarg.backend;

import com.krishimarg.backend.logistics.dto.*;
import com.krishimarg.backend.common.exceptions.InvalidRouteStateException;
import com.krishimarg.backend.common.exceptions.RouteAlreadyAcceptedException;
import com.krishimarg.backend.common.exceptions.RouteNotFoundException;
import com.krishimarg.backend.common.exceptions.RouteOptimizerUnavailableException;
import com.krishimarg.backend.common.exceptions.UnauthorizedDriverException;
import com.krishimarg.backend.logistics.models.DeliveryRoute;
import com.krishimarg.backend.order.models.Order;
import com.krishimarg.backend.logistics.repositories.DeliveryRouteRepository;
import com.krishimarg.backend.order.repositories.OrderRepository;
import com.krishimarg.backend.logistics.services.LogisticsService;
import com.krishimarg.backend.logistics.services.MockEscrowService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LogisticsServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private DeliveryRouteRepository deliveryRouteRepository;

    @Mock
    private MockEscrowService mockEscrowService;

    @Mock
    private RestTemplate restTemplate;

    private ObjectMapper objectMapper;
    private LogisticsService logisticsService;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        logisticsService = new LogisticsService(
                orderRepository,
                deliveryRouteRepository,
                mockEscrowService,
                restTemplate,
                objectMapper
        );
    }

    @Test
    @DisplayName("Test 1: PENDING_ROUTE orders -> Python OR-Tools -> DeliveryRoute saved & orders ROUTE_ASSIGNED")
    void testOptimizePendingRoutes_Success() {
        // Arrange
        Order order1 = new Order("ord_7701", "b_501", "[\"lot_901\"]", new BigDecimal("9250.00"),
                18.5018, 73.8636, Order.STATUS_PENDING_ROUTE);
        when(orderRepository.findByStatus(Order.STATUS_PENDING_ROUTE)).thenReturn(Collections.singletonList(order1));

        List<RouteCoordinate> coords = Arrays.asList(
                new RouteCoordinate(18.3489, 74.0312),
                new RouteCoordinate(18.5018, 73.8636)
        );
        List<OrderedStopDto> stops = Arrays.asList(
                new OrderedStopDto("PICKUP", "lot_901", null, 18.3489, 74.0312),
                new OrderedStopDto("DROPOFF", null, "ord_7701", 18.5018, 73.8636)
        );
        OptimizeRoutePythonResponse pythonResponse = new OptimizeRoutePythonResponse("route_999", 42.6, coords, stops);

        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(OptimizeRoutePythonResponse.class)))
                .thenReturn(new ResponseEntity<>(pythonResponse, HttpStatus.OK));

        when(deliveryRouteRepository.save(any(DeliveryRoute.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        OptimizeRouteResponse response = logisticsService.optimizePendingRoutes();

        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Route optimized successfully", response.getMessage());
        assertEquals("route_999", response.getRouteId());
        assertEquals(42.6, response.getTotalDistanceKm());
        assertEquals(2, response.getRouteCoordinates().size());

        // Verify order updated to ROUTE_ASSIGNED and linked to route
        assertEquals(Order.STATUS_ROUTE_ASSIGNED, order1.getStatus());
        assertEquals("route_999", order1.getRouteId());
        verify(orderRepository).saveAll(anyList());
        verify(deliveryRouteRepository).save(any(DeliveryRoute.class));
    }

    @Test
    @DisplayName("Empty order list returns success with friendly message")
    void testOptimizePendingRoutes_EmptyList() {
        when(orderRepository.findByStatus(Order.STATUS_PENDING_ROUTE)).thenReturn(Collections.emptyList());

        OptimizeRouteResponse response = logisticsService.optimizePendingRoutes();

        assertTrue(response.isSuccess());
        assertEquals("No orders pending for route optimization", response.getMessage());
        verifyNoInteractions(restTemplate);
        verify(deliveryRouteRepository, never()).save(any());
    }

    @Test
    @DisplayName("Test 7: Python service unavailable returns clean error")
    void testOptimizePendingRoutes_PythonUnavailable() {
        Order order1 = new Order("ord_7701", "b_501", "[\"lot_901\"]", new BigDecimal("9250.00"),
                18.5018, 73.8636, Order.STATUS_PENDING_ROUTE);
        when(orderRepository.findByStatus(Order.STATUS_PENDING_ROUTE)).thenReturn(Collections.singletonList(order1));

        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(OptimizeRoutePythonResponse.class)))
                .thenThrow(new ResourceAccessException("Connection refused: connect"));

        RouteOptimizerUnavailableException ex = assertThrows(RouteOptimizerUnavailableException.class, () -> {
            logisticsService.optimizePendingRoutes();
        });

        assertTrue(ex.getMessage().contains("Route optimization service is unavailable"));
        verify(deliveryRouteRepository, never()).save(any());
    }

    @Test
    @DisplayName("Test 2: GET /api/v1/driver/routes returns available routes")
    void testGetAvailableRoutes() {
        DeliveryRoute route = new DeliveryRoute(
                "route_101",
                "[{\"latitude\":18.5204,\"longitude\":73.8567}]",
                DeliveryRoute.STATUS_PENDING_DRIVER,
                15.5,
                new BigDecimal("587.50"),
                "[]",
                1,
                1
        );
        when(deliveryRouteRepository.findByStatusIn(anyCollection())).thenReturn(Collections.singletonList(route));

        List<DriverRouteResponse> routes = logisticsService.getAvailableRoutes(18.4, 73.9, null);

        assertNotNull(routes);
        assertEquals(1, routes.size());
        assertEquals("route_101", routes.get(0).getRouteId());
        assertEquals(DeliveryRoute.STATUS_PENDING_DRIVER, routes.get(0).getStatus());
        assertEquals(1, routes.get(0).getRouteCoordinates().size());
    }

    @Test
    @DisplayName("Test 3: POST /api/v1/driver/routes/{id}/accept changes route to ACCEPTED")
    void testAcceptRoute_Success() {
        DeliveryRoute route = new DeliveryRoute(
                "route_101",
                "[]",
                DeliveryRoute.STATUS_PENDING_DRIVER,
                15.5,
                new BigDecimal("587.50"),
                "[]",
                1,
                1
        );
        when(deliveryRouteRepository.findById("route_101")).thenReturn(Optional.of(route));
        when(deliveryRouteRepository.save(any(DeliveryRoute.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RouteActionResponse response = logisticsService.acceptRoute("route_101", "d_801");

        assertTrue(response.isSuccess());
        assertEquals(DeliveryRoute.STATUS_ACCEPTED, response.getStatus());
        assertEquals("d_801", route.getDriverId());
        assertEquals(DeliveryRoute.STATUS_ACCEPTED, route.getStatus());
    }

    @Test
    @DisplayName("Test 5: Concurrent acceptance - Driver attempts to accept already accepted route -> Conflict (409)")
    void testAcceptRoute_ConflictAlreadyAccepted() {
        DeliveryRoute route = new DeliveryRoute(
                "route_101",
                "[]",
                DeliveryRoute.STATUS_ACCEPTED,
                15.5,
                new BigDecimal("587.50"),
                "[]",
                1,
                1
        );
        route.setDriverId("d_801"); // Already accepted by driver d_801

        when(deliveryRouteRepository.findById("route_101")).thenReturn(Optional.of(route));

        // Another driver (d_902) tries to claim it
        RouteAlreadyAcceptedException ex = assertThrows(RouteAlreadyAcceptedException.class, () -> {
            logisticsService.acceptRoute("route_101", "d_902");
        });

        assertTrue(ex.getMessage().contains("already been accepted"));
        verify(deliveryRouteRepository, never()).save(any());
    }

    @Test
    @DisplayName("Route not found throws RouteNotFoundException (404)")
    void testAcceptRoute_NotFound() {
        when(deliveryRouteRepository.findById("invalid_id")).thenReturn(Optional.empty());

        assertThrows(RouteNotFoundException.class, () -> {
            logisticsService.acceptRoute("invalid_id", "d_801");
        });
    }

    @Test
    @DisplayName("Test 4: POST /api/v1/driver/routes/{id}/complete transitions to COMPLETED & triggers Mock Escrow")
    void testCompleteRoute_Success() {
        DeliveryRoute route = new DeliveryRoute(
                "route_101",
                "[]",
                DeliveryRoute.STATUS_ACCEPTED,
                15.5,
                new BigDecimal("587.50"),
                "[]",
                1,
                1
        );
        route.setDriverId("d_801");

        Order order = new Order("ord_7701", "b_501", "[\"lot_901\"]", new BigDecimal("9250.00"),
                18.5018, 73.8636, Order.STATUS_ROUTE_ASSIGNED);
        order.setRouteId("route_101");

        when(deliveryRouteRepository.findById("route_101")).thenReturn(Optional.of(route));
        when(deliveryRouteRepository.save(any(DeliveryRoute.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderRepository.findByRouteId("route_101")).thenReturn(Collections.singletonList(order));
        when(mockEscrowService.releaseEscrow(eq(route), anyList())).thenReturn("Released ₹9250 to farmers and ₹587.50 to driver d_801");

        RouteActionResponse response = logisticsService.completeRoute("route_101", "d_801");

        assertTrue(response.isSuccess());
        assertEquals(DeliveryRoute.STATUS_COMPLETED, response.getStatus());
        assertEquals("MOCK_ESCROW_RELEASED", response.getPayoutStatus());
        assertNotNull(route.getCompletedAt());
        assertEquals(Order.STATUS_DELIVERED, order.getStatus());

        verify(mockEscrowService).releaseEscrow(eq(route), anyList());
        verify(orderRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("Test 6: Completing another driver's route is rejected with UnauthorizedDriverException (403)")
    void testCompleteRoute_UnauthorizedDriver() {
        DeliveryRoute route = new DeliveryRoute(
                "route_101",
                "[]",
                DeliveryRoute.STATUS_ACCEPTED,
                15.5,
                new BigDecimal("587.50"),
                "[]",
                1,
                1
        );
        route.setDriverId("d_801"); // Belongs to d_801

        when(deliveryRouteRepository.findById("route_101")).thenReturn(Optional.of(route));

        // Driver d_999 tries to complete it
        UnauthorizedDriverException ex = assertThrows(UnauthorizedDriverException.class, () -> {
            logisticsService.completeRoute("route_101", "d_999");
        });

        assertTrue(ex.getMessage().contains("not authorized"));
        verifyNoInteractions(mockEscrowService);
    }

    @Test
    @DisplayName("Completing a non-accepted route throws InvalidRouteStateException (400)")
    void testCompleteRoute_InvalidState() {
        DeliveryRoute route = new DeliveryRoute(
                "route_101",
                "[]",
                DeliveryRoute.STATUS_PENDING_DRIVER,
                15.5,
                new BigDecimal("587.50"),
                "[]",
                1,
                1
        );

        when(deliveryRouteRepository.findById("route_101")).thenReturn(Optional.of(route));

        InvalidRouteStateException ex = assertThrows(InvalidRouteStateException.class, () -> {
            logisticsService.completeRoute("route_101", "d_801");
        });

        assertTrue(ex.getMessage().contains("must be ACCEPTED"));
        verifyNoInteractions(mockEscrowService);
    }
}
