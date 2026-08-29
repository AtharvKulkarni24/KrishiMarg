package com.krishimarg.backend.order.repositories;

import com.krishimarg.backend.order.models.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    List<Order> findByStatus(String status);

    List<Order> findByRouteId(String routeId);

    List<Order> findByOrderIdIn(Collection<String> orderIds);
}
