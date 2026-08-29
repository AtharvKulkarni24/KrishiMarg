package com.krishimarg.backend.order.services;

import tools.jackson.databind.ObjectMapper;
import com.krishimarg.backend.order.dto.CreateOrderRequest;
import com.krishimarg.backend.order.models.Order;
import com.krishimarg.backend.produce.models.ProduceLot;
import com.krishimarg.backend.order.repositories.OrderRepository;
import com.krishimarg.backend.produce.repositories.ProduceLotRepository;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class BuyerService {

    private static final Logger log = LoggerFactory.getLogger(BuyerService.class);

    private final ProduceLotRepository produceLotRepository;
    private final OrderRepository orderRepository;
    private final GeometryFactory geometryFactory;
    private final ObjectMapper objectMapper;

    public BuyerService(ProduceLotRepository produceLotRepository, OrderRepository orderRepository, ObjectMapper objectMapper) {
        this.produceLotRepository = produceLotRepository;
        this.orderRepository = orderRepository;
        this.objectMapper = objectMapper;
        // EPSG:4326 is standard for WGS84 lat/lng
        this.geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
    }

    public List<ProduceLot> searchProduceLots(Double lat, Double lng, Double radiusKm, String crop) {
        if (lat == null || lng == null) {
            throw new IllegalArgumentException("Latitude and longitude are required for search");
        }
        
        double radiusMeters = (radiusKm != null ? radiusKm : 50.0) * 1000.0;
        Point buyerLocation = geometryFactory.createPoint(new Coordinate(lng, lat));

        if (crop != null && !crop.trim().isEmpty()) {
            return produceLotRepository.findLotsWithinRadiusAndCrop(ProduceLot.STATUS_AVAILABLE, "%" + crop + "%", buyerLocation, radiusMeters);
        }
        return produceLotRepository.findLotsWithinRadius(ProduceLot.STATUS_AVAILABLE, buyerLocation, radiusMeters);
    }

    @Transactional
    public Order checkoutOrder(CreateOrderRequest request) {
        List<String> lotIds = request.getLotIds();
        if (lotIds == null || lotIds.isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one produce lot");
        }

        List<ProduceLot> lots = produceLotRepository.findAllById(lotIds);
        if (lots.size() != lotIds.size()) {
            throw new IllegalArgumentException("One or more lots not found");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (ProduceLot lot : lots) {
            if (!ProduceLot.STATUS_AVAILABLE.equals(lot.getStatus())) {
                throw new IllegalStateException("Lot " + lot.getLotId() + " is no longer available");
            }
            // Add (pricePerKg * quantityKg) to total
            BigDecimal itemTotal = lot.getPricePerKg().multiply(BigDecimal.valueOf(lot.getQuantityKg()));
            totalAmount = totalAmount.add(itemTotal);
            
            // Mark lot as SOLD
            lot.setStatus(ProduceLot.STATUS_SOLD);
        }
        
        // Save updated lots
        produceLotRepository.saveAll(lots);

        // Process Mock Payment
        log.info("Processing mock payment of ₹{} for buyer {}", totalAmount, request.getBuyerId());
        log.info("Mock payment successful.");

        // Serialize lotIds to JSON array string
        String lotIdsJson = "[]";
        try {
            lotIdsJson = objectMapper.writeValueAsString(lotIds);
        } catch (Exception e) {
            log.error("Failed to serialize lot IDs", e);
        }

        // Create Order
        Order order = new Order(
                "ord_" + UUID.randomUUID().toString(),
                request.getBuyerId(),
                lotIdsJson,
                totalAmount,
                request.getDropoffLatitude(),
                request.getDropoffLongitude(),
                Order.STATUS_PENDING_ROUTE
        );
        order.setPaymentStatus("SUCCESS"); // Mock payment was successful

        Order savedOrder = orderRepository.save(order);
        log.info("Created new order {} with status PENDING_ROUTE", savedOrder.getOrderId());
        
        return savedOrder;
    }
}
