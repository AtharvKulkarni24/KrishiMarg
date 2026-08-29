package com.krishimarg.backend.controllers;

import com.krishimarg.backend.dto.CreateOrderRequest;
import com.krishimarg.backend.models.Order;
import com.krishimarg.backend.models.ProduceLot;
import com.krishimarg.backend.services.BuyerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class BuyerController {

    private final BuyerService buyerService;

    public BuyerController(BuyerService buyerService) {
        this.buyerService = buyerService;
    }

    @GetMapping("/buyer/search")
    public ResponseEntity<List<ProduceLot>> searchProduceLots(
            @RequestParam("lat") Double lat,
            @RequestParam("lng") Double lng,
            @RequestParam(value = "radiusKm", required = false) Double radiusKm) {
        
        List<ProduceLot> lots = buyerService.searchProduceLots(lat, lng, radiusKm);
        return ResponseEntity.ok(lots);
    }

    @PostMapping("/orders")
    public ResponseEntity<Order> createOrder(@RequestBody CreateOrderRequest request) {
        Order order = buyerService.checkoutOrder(request);
        return ResponseEntity.ok(order);
    }
}
