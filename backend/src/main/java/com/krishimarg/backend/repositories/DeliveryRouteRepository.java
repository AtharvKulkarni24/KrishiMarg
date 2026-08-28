package com.krishimarg.backend.repositories;

import com.krishimarg.backend.models.DeliveryRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface DeliveryRouteRepository extends JpaRepository<DeliveryRoute, String> {

    List<DeliveryRoute> findByStatus(String status);

    List<DeliveryRoute> findByStatusIn(Collection<String> statuses);

    List<DeliveryRoute> findByDriverId(String driverId);

    List<DeliveryRoute> findByDriverIdAndStatus(String driverId, String status);

    List<DeliveryRoute> findByStatusInOrDriverId(Collection<String> statuses, String driverId);
}
