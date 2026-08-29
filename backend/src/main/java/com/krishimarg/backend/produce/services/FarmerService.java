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

@Service
public class FarmerService {

    private final ProduceLotRepository produceLotRepository;
    private final GeometryFactory geometryFactory;

    public FarmerService(ProduceLotRepository produceLotRepository) {
        this.produceLotRepository = produceLotRepository;
        // EPSG:4326 is standard for WGS84 lat/lng
        this.geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
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
                location
        );

        return produceLotRepository.save(lot);
    }

    public List<ProduceLot> getProduceLotsByFarmer(String farmerId) {
        return produceLotRepository.findByFarmerId(farmerId);
    }

    public Map<String, Object> getInsights() {
        // Mock data for Mandi rates and Prophet ML forecast
        Map<String, Object> insights = new HashMap<>();
        
        Map<String, Object> mandiRates = new HashMap<>();
        mandiRates.put("Wheat", 2200.0);
        mandiRates.put("Rice", 3500.0);
        mandiRates.put("Onion", 1800.0);
        insights.put("current_mandi_rates_per_quintal", mandiRates);

        Map<String, Object> mlForecast = new HashMap<>();
        mlForecast.put("Wheat_next_week_trend", "UP");
        mlForecast.put("Rice_next_week_trend", "STABLE");
        mlForecast.put("Onion_next_week_trend", "DOWN");
        insights.put("prophet_ml_forecast", mlForecast);

        return insights;
    }
}
