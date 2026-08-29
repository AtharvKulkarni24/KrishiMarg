package com.krishimarg.backend;

import com.krishimarg.backend.logistics.controllers.DriverController;
import com.krishimarg.backend.logistics.controllers.LogisticsController;
import com.krishimarg.backend.logistics.dto.*;
import com.krishimarg.backend.logistics.services.LogisticsService;
import com.krishimarg.backend.common.exceptions.GlobalExceptionHandler;
import com.krishimarg.backend.common.exceptions.InvalidRouteStateException;
import com.krishimarg.backend.common.exceptions.RouteAlreadyAcceptedException;
import com.krishimarg.backend.common.exceptions.RouteNotFoundException;
import com.krishimarg.backend.common.exceptions.RouteOptimizerUnavailableException;
import com.krishimarg.backend.common.exceptions.UnauthorizedDriverException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class LogisticsAndDriverControllerTest {

    private MockMvc mockMvc;

    @Mock
    private LogisticsService logisticsService;

    @BeforeEach
    void setUp() {
        LogisticsController logisticsController = new LogisticsController(logisticsService);
        DriverController driverController = new DriverController(logisticsService);
        GlobalExceptionHandler exceptionHandler = new GlobalExceptionHandler();

        mockMvc = MockMvcBuilders.standaloneSetup(logisticsController, driverController)
                .setControllerAdvice(exceptionHandler)
                .build();
    }

    @Test
    @DisplayName("POST /api/v1/logistics/optimize-route -> 200 OK with route details")
    void testOptimizeRouteApi_Success() throws Exception {
        OptimizeRouteResponse response = new OptimizeRouteResponse(
                true,
                "Route optimized successfully",
                "route_101",
                Arrays.asList(new RouteCoordinate(18.5204, 73.8567)),
                42.6,
                Collections.emptyList()
        );

        when(logisticsService.optimizePendingRoutes()).thenReturn(response);

        mockMvc.perform(post("/api/v1/logistics/optimize-route"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Route optimized successfully"))
                .andExpect(jsonPath("$.routeId").value("route_101"))
                .andExpect(jsonPath("$.routeCoordinates[0].latitude").value(18.5204))
                .andExpect(jsonPath("$.routeCoordinates[0].longitude").value(73.8567));
    }

    @Test
    @DisplayName("POST /api/v1/logistics/optimize-route -> 503 Service Unavailable when Python down")
    void testOptimizeRouteApi_PythonDown() throws Exception {
        when(logisticsService.optimizePendingRoutes())
                .thenThrow(new RouteOptimizerUnavailableException("Route optimization service is unavailable"));

        mockMvc.perform(post("/api/v1/logistics/optimize-route"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Route optimization service is unavailable"));
    }

    @Test
    @DisplayName("GET /api/v1/driver/routes -> 200 OK with list of available routes")
    void testGetDriverRoutesApi_Success() throws Exception {
        DriverRouteResponse routeDto = new DriverRouteResponse(
                "route_101",
                null,
                "PENDING_DRIVER",
                42.6,
                2,
                1,
                new BigDecimal("1265.00"),
                Arrays.asList(new RouteCoordinate(18.5204, 73.8567)),
                Collections.emptyList()
        );

        when(logisticsService.getAvailableRoutes(any(), any(), any()))
                .thenReturn(Collections.singletonList(routeDto));

        mockMvc.perform(get("/api/v1/driver/routes?lat=18.4&lng=73.9"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].routeId").value("route_101"))
                .andExpect(jsonPath("$[0].status").value("PENDING_DRIVER"))
                .andExpect(jsonPath("$[0].routeCoordinates[0].latitude").value(18.5204));
    }

    @Test
    @DisplayName("POST /api/v1/driver/routes/{id}/accept -> 200 OK")
    void testAcceptRouteApi_Success() throws Exception {
        RouteActionResponse actionResponse = new RouteActionResponse(
                true,
                "Route accepted successfully",
                "route_101",
                "ACCEPTED"
        );

        when(logisticsService.acceptRoute(eq("route_101"), anyString()))
                .thenReturn(actionResponse);

        mockMvc.perform(post("/api/v1/driver/routes/route_101/accept")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"driver_id\": \"d_801\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.status").value("ACCEPTED"))
                .andExpect(jsonPath("$.routeId").value("route_101"));
    }

    @Test
    @DisplayName("POST /api/v1/driver/routes/{id}/accept -> 409 Conflict when already accepted")
    void testAcceptRouteApi_Conflict() throws Exception {
        when(logisticsService.acceptRoute(eq("route_101"), anyString()))
                .thenThrow(new RouteAlreadyAcceptedException("Route route_101 has already been accepted by another driver"));

        mockMvc.perform(post("/api/v1/driver/routes/route_101/accept")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"driver_id\": \"d_902\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Route route_101 has already been accepted by another driver"));
    }

    @Test
    @DisplayName("POST /api/v1/driver/routes/{id}/complete -> 200 OK with mock escrow release")
    void testCompleteRouteApi_Success() throws Exception {
        RouteActionResponse actionResponse = new RouteActionResponse(
                true,
                "Route completed and mock escrow released",
                "route_101",
                "COMPLETED",
                "MOCK_ESCROW_RELEASED"
        );

        when(logisticsService.completeRoute(eq("route_101"), any()))
                .thenReturn(actionResponse);

        mockMvc.perform(post("/api/v1/driver/routes/route_101/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"driver_id\": \"d_801\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.payout_status").value("MOCK_ESCROW_RELEASED"));
    }

    @Test
    @DisplayName("POST /api/v1/driver/routes/{id}/complete -> 403 Forbidden for unauthorized driver")
    void testCompleteRouteApi_Unauthorized() throws Exception {
        when(logisticsService.completeRoute(eq("route_101"), eq("d_999")))
                .thenThrow(new UnauthorizedDriverException("Driver d_999 is not authorized to complete route route_101"));

        mockMvc.perform(post("/api/v1/driver/routes/route_101/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"driver_id\": \"d_999\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Driver d_999 is not authorized to complete route route_101"));
    }

    @Test
    @DisplayName("POST /api/v1/driver/routes/{id}/complete -> 400 Bad Request for invalid route state")
    void testCompleteRouteApi_InvalidState() throws Exception {
        when(logisticsService.completeRoute(eq("route_101"), any()))
                .thenThrow(new InvalidRouteStateException("Route route_101 cannot be completed because its current status is PENDING_DRIVER"));

        mockMvc.perform(post("/api/v1/driver/routes/route_101/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"driver_id\": \"d_801\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Route route_101 cannot be completed because its current status is PENDING_DRIVER"));
    }

    @Test
    @DisplayName("Route not found returns 404")
    void testRouteNotFound() throws Exception {
        when(logisticsService.acceptRoute(eq("missing_route"), any()))
                .thenThrow(new RouteNotFoundException("Route not found with ID: missing_route"));

        mockMvc.perform(post("/api/v1/driver/routes/missing_route/accept"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Route not found with ID: missing_route"));
    }
}
