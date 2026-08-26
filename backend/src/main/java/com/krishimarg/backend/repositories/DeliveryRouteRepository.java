package com.krishimarg.backend.repositories;

import com.krishimarg.backend.models.DeliveryRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryRouteRepository extends JpaRepository<DeliveryRoute, String> {
    List<DeliveryRoute> findByStatus(String status);
}
