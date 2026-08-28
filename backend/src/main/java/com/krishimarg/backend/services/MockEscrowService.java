package com.krishimarg.backend.services;

import com.krishimarg.backend.models.DeliveryRoute;
import com.krishimarg.backend.models.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class MockEscrowService {

    private static final Logger log = LoggerFactory.getLogger(MockEscrowService.class);

    @Value("${logistics.driver.base-fare:200.00}")
    private BigDecimal baseFare;

    @Value("${logistics.driver.per-km-rate:25.00}")
    private BigDecimal perKmRate;

    /**
     * Releases mock escrow payments for farmers and the assigned driver upon route completion.
     *
     * @param route  the completed delivery route
     * @param orders the orders delivered within this route
     * @return summary message of the released escrow
     */
    public String releaseEscrow(DeliveryRoute route, List<Order> orders) {
        log.info("Starting mock escrow release process for route ID: {}", route.getRouteId());

        // 1. Calculate total farmer payout across all orders in the route
        BigDecimal totalFarmerPayout = BigDecimal.ZERO;
        if (orders != null) {
            for (Order order : orders) {
                if (order.getTotalAmount() != null) {
                    totalFarmerPayout = totalFarmerPayout.add(order.getTotalAmount());
                }
            }
        }

        // 2. Calculate driver payout
        BigDecimal driverPayout = route.getEstimatedPayout();
        if (driverPayout == null || driverPayout.compareTo(BigDecimal.ZERO) <= 0) {
            double distance = route.getTotalDistanceKm() != null ? route.getTotalDistanceKm() : 10.0;
            driverPayout = baseFare.add(perKmRate.multiply(BigDecimal.valueOf(distance)));
        }

        log.info("Mock Escrow Released: ₹{} transferred to farmers for {} orders; ₹{} transferred to driver {} (Route: {})",
                totalFarmerPayout, orders != null ? orders.size() : 0, driverPayout, route.getDriverId(), route.getRouteId());

        return String.format("Released ₹%s to farmers and ₹%s to driver %s", totalFarmerPayout, driverPayout, route.getDriverId());
    }
}
