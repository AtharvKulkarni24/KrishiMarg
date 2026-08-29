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

    @GetMapping("/insights")
    public ResponseEntity<Map<String, Object>> getInsights() {
        return ResponseEntity.ok(farmerService.getInsights());
    }
}
