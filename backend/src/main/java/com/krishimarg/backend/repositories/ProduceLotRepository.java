package com.krishimarg.backend.repositories;

import com.krishimarg.backend.models.ProduceLot;
import org.locationtech.jts.geom.Point;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduceLotRepository extends JpaRepository<ProduceLot, String> {

    List<ProduceLot> findByFarmerId(String farmerId);

    // PostGIS spatial query: find all lots with a specific status within distance (in meters) of a point
    // Since coordinates are EPSG:4326, ST_DWithin with geography type uses meters.
    @Query(value = "SELECT * FROM produce_lots p WHERE p.status = :status AND ST_DWithin(p.location\\:\\:geography, :point\\:\\:geography, :radiusInMeters)", nativeQuery = true)
    List<ProduceLot> findLotsWithinRadius(@Param("status") String status, @Param("point") Point point, @Param("radiusInMeters") double radiusInMeters);
}
