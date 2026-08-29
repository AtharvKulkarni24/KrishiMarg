package com.krishimarg.backend.common.config;

import com.krishimarg.backend.order.models.Order;
import com.krishimarg.backend.user.models.User;
import com.krishimarg.backend.order.repositories.OrderRepository;
import com.krishimarg.backend.user.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public DataInitializer(UserRepository userRepository, OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    public void run(String... args) {
        // Seed users if not present
        if (userRepository.count() == 0) {
            log.info("Seeding initial users from API contract...");
            User farmer1 = new User("f_101", "Ramesh Patil", "FARMER", 18.3489, 74.0312);
            User farmer2 = new User("f_102", "Suresh Mohite", "FARMER", 18.3245, 74.0118);
            User buyer1 = new User("b_501", "Green Leaf Restaurant", "BUYER", 18.5018, 73.8636);
            User driver1 = new User("d_801", "Ravi Kumar (Driver)", "DRIVER", 18.4000, 73.9000);

            userRepository.saveAll(Arrays.asList(farmer1, farmer2, buyer1, driver1));
            log.info("Seeded 4 users.");
        }

        // Seed initial pending orders if not present
        if (orderRepository.count() == 0) {
            log.info("Seeding initial PENDING_ROUTE orders from API contract...");
            Order order1 = new Order(
                    "ord_7701",
                    "b_501",
                    "[\"lot_901\", \"lot_902\"]",
                    new BigDecimal("9250.00"),
                    18.5018,
                    73.8636,
                    Order.STATUS_PENDING_ROUTE
            );

            Order order2 = new Order(
                    "ord_7702",
                    "b_501",
                    "[\"lot_903\"]",
                    new BigDecimal("5300.00"),
                    18.5204,
                    73.8567,
                    Order.STATUS_PENDING_ROUTE
            );

            orderRepository.saveAll(Arrays.asList(order1, order2));
            log.info("Seeded 2 PENDING_ROUTE orders: ord_7701, ord_7702");
        }
    }
}
