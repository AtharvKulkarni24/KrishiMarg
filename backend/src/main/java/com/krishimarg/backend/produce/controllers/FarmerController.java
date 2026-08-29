package com.krishimarg.backend.produce.controllers;

import com.krishimarg.backend.produce.dto.CreateProduceRequest;
import com.krishimarg.backend.produce.models.ProduceLot;
import com.krishimarg.backend.produce.services.FarmerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/farmer")
public class FarmerController {

    private final FarmerService farmerService;

    public FarmerController(FarmerService farmerService) {
        this.farmerService = farmerService;
    }

    @PostMapping("/produce")
    public ResponseEntity<ProduceLot> createProduceLot(@RequestBody CreateProduceRequest request) {
        ProduceLot lot = farmerService.createProduceLot(request);
        return ResponseEntity.ok(lot);
    }

    @GetMapping("/produce/{farmerId}")
    public ResponseEntity<List<ProduceLot>> getProduceLots(@PathVariable String farmerId) {
        return ResponseEntity.ok(farmerService.getProduceLotsByFarmer(farmerId));
    }

    @PatchMapping("/produce/{lotId}")
    public ResponseEntity<ProduceLot> addHarvestQuantity(
            @PathVariable String lotId,
            @RequestBody Map<String, Double> request) {
        // the frontend sends {"additional_quantity_kg": 50}
        Double added = request.get("additional_quantity_kg");
        if (added == null) added = 0.0;
        ProduceLot updatedLot = farmerService.addHarvestQuantity(lotId, added);
        return ResponseEntity.ok(updatedLot);
    }

    @GetMapping("/insights")
    public ResponseEntity<Map<String, Object>> getInsights() {
        return ResponseEntity.ok(farmerService.getInsights());
    }
}
