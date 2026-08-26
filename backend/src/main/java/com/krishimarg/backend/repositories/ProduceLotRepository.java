package com.krishimarg.backend.repositories;

import com.krishimarg.backend.models.ProduceLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduceLotRepository extends JpaRepository<ProduceLot, String> {
    
    List<ProduceLot> findByStatus(String status);

    @Query(value = "SELECT * FROM produce_lots p WHERE p.status = 'AVAILABLE' AND p.crop_name = :cropName AND ST_DWithin(p.farm_location::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radiusMeters)", nativeQuery = true)
    List<ProduceLot> findNearbyAvailableProduce(
            @Param("cropName") String cropName, 
            @Param("lat") double lat, 
            @Param("lng") double lng, 
            @Param("radiusMeters") double radiusMeters);
}
