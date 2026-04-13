package com.motori.backoffice_service.config;

import com.motori.order.model.Order;
import com.motori.order.model.OrderItem;
import com.motori.order.model.OrderStatus;
import com.motori.backoffice_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Sample orders for dashboards when {@code orders} is empty (same pattern as catalog seed / user admin).
 */
@Component
@RequiredArgsConstructor
public class BackofficeOrderTestDataInitializer implements CommandLineRunner {

    private final OrderRepository orderRepository;

    @Override
    public void run(String... args) {
        if (orderRepository.count() > 0) {
            return;
        }

        Order demo = Order.builder()
                .userId("demo-user-keycloak-sub")
                .status(OrderStatus.CONFIRMED)
                .totalAmount(new BigDecimal("99.90"))
                .shippingAddress("10 rue de démo, 75001 Paris")
                .trackingNumber("MOT-DEMO-001")
                .build();

        OrderItem line = OrderItem.builder()
                .order(demo)
                .inventoryId(UUID.fromString("00000000-0000-0000-0000-000000000099"))
                .productName("Article démo catalogue")
                .quantity(2)
                .unitPrice(new BigDecimal("49.95"))
                .build();
        demo.getItems().add(line);

        orderRepository.save(demo);
    }
}
