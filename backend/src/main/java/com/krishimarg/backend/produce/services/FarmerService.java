package com.krishimarg.backend.produce.services;

import com.krishimarg.backend.produce.dto.CreateProduceRequest;
import com.krishimarg.backend.produce.models.ProduceLot;
import com.krishimarg.backend.produce.repositories.ProduceLotRepository;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

@Service
public class FarmerService {

    private final ProduceLotRepository produceLotRepository;
    private final GeometryFactory geometryFactory;
    private final RestTemplate restTemplate;

    @Value("${ai.forecast.url:http://localhost:8000/api/v1/forecast}")
    private String forecastUrl = "http://localhost:8000/api/v1/forecast";

    public FarmerService(ProduceLotRepository produceLotRepository, RestTemplate restTemplate) {
        this.produceLotRepository = produceLotRepository;
        // EPSG:4326 is standard for WGS84 lat/lng
        this.geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
        this.restTemplate = restTemplate;
    }

    @Transactional
    public ProduceLot createProduceLot(CreateProduceRequest request) {
        Point location = null;
        if (request.getLatitude() != null && request.getLongitude() != null) {
            // Note: JTS Coordinate uses (x, y) which is (longitude, latitude)
            location = geometryFactory.createPoint(new Coordinate(request.getLongitude(), request.getLatitude()));
        }

        ProduceLot lot = new ProduceLot(
                "lot_" + UUID.randomUUID().toString(),
                request.getFarmerId(),
                request.getCropName(),
                request.getQuantityKg(),
                request.getPricePerKg(),
                location,
                request.getHarvestDate(),
                request.getImageUrl()
        );

        return produceLotRepository.save(lot);
    }

    public List<ProduceLot> getProduceLotsByFarmer(String farmerId) {
        return produceLotRepository.findByFarmerId(farmerId);
    }

    @Transactional
    public ProduceLot addHarvestQuantity(String lotId, Double additionalQuantityKg) {
        ProduceLot lot = produceLotRepository.findById(lotId)
                .orElseThrow(() -> new IllegalArgumentException("Lot not found"));
        lot.setQuantityKg(lot.getQuantityKg() + additionalQuantityKg);
        return produceLotRepository.save(lot);
    }

    public Map<String, Object> getInsights() {
        // Mock data for Mandi rates and real data for Prophet ML forecast
        Map<String, Object> insights = new HashMap<>();
        
        Map<String, Object> mandiRates = new HashMap<>();
        mandiRates.put("Wheat", 2200.0);
        mandiRates.put("Rice", 3500.0);
        mandiRates.put("Onion", 1800.0);
        insights.put("current_mandi_rates_per_quintal", mandiRates);

        Map<String, Object> mlForecast = new HashMap<>();
        String[] crops = {"Wheat", "Rice", "Onion"};
        
        for (String crop : crops) {
            try {
                String url = forecastUrl + "?crop=" + crop;
                org.springframework.http.ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                        url,
                        org.springframework.http.HttpMethod.GET,
                        null,
                        new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {}
                );
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    mlForecast.put(crop + "_next_week_trend", response.getBody().get("forecast_trend"));
                } else {
                    mlForecast.put(crop + "_next_week_trend", "UNKNOWN");
                }
            } catch (Exception e) {
                mlForecast.put(crop + "_next_week_trend", "UNAVAILABLE");
            }
        }
        
        insights.put("prophet_ml_forecast", mlForecast);
        return insights;
    }
}
