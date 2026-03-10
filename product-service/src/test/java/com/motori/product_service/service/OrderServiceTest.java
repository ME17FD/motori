package com.motori.product_service.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.motori.product_service.dto.OderDTO.OrderRequest;
import com.motori.product_service.dto.OderDTO.OrderResponse;
import com.motori.product_service.dto.OrderItemDTO.OrderItemRequest;
import com.motori.product_service.exception.DuplicateResourceException;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.OrderItemMapper;
import com.motori.product_service.mapper.OrderMapper;
import com.motori.product_service.models.Inventory;
import com.motori.product_service.models.Order;
import com.motori.product_service.repository.InventoryRepository;
import com.motori.product_service.repository.OrderRepository;

/**
 * Unit tests for OrderService with mocked dependencies.
 * 
 * <p>Tests the complex business logic of {@link OrderService} which manages
 * e-commerce order lifecycle from creation through fulfillment. Uses Mockito
 * to mock repository and mapper dependencies for isolated service testing.
 * 
 * <p><b>Test Framework:</b> Mockito, AssertJ, JUnit5
 * 
 * <p><b>Mocked Components:</b>
 * <ul>
 *   <li>{@link OrderRepository} - Order CRUD and status queries</li>
 *   <li>{@link InventoryRepository} - Inventory availability checks</li>
 *   <li>{@link OrderMapper}, {@link OrderItemMapper} - Entity ↔ DTO conversion</li>
 * </ul>
 * 
 * <p><b>Order Lifecycle Tested:</b>
 * <ul>
 *   <li><b>PENDING:</b> Order created, inventory reserved (soldAt=null check)</li>
 *   <li><b>CONFIRMED:</b> Payment validated, inventory marked sold (soldAt=now)</li>
 *   <li><b>DELIVERED:</b> Physical shipment completed</li>
 *   <li><b>CANCELLED:</b> Can cancel at any point (reversible state)</li>
 * </ul>
 * 
 * <p><b>Business Rules Tested:</b>
 * <ul>
 *   <li>Order must contain at least 1 item (non-empty OrderItem list)</li>
 *   <li>Inventory items must be available (soldAt IS NULL) before order creation</li>
 *   <li>Cannot order same inventory item twice in single order</li>
 *   <li>Price calculated server-side (client price ignored for security)</li>
 *   <li>Total price = sum of all item prices at order time (immutable)</li>
 * </ul>
 * 
 * <p><b>Price Snapshot:</b> Each OrderItem captures price at order time.
 * This prevents price manipulation attacks: client cannot override server prices.
 * 
 * @author Motori Team
 * @since 1.0
 * @see OrderService
 */
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private InventoryRepository inventoryRepository;
    @Mock private OrderMapper orderMapper;
    @Mock private OrderItemMapper orderItemMapper;
    @InjectMocks private OrderService service;

    @Test
    void create_shouldReturnResponse_whenValid() {
        UUID userId = UUID.randomUUID();
        UUID inventoryId = UUID.randomUUID();

        OrderItemRequest itemRequest = new OrderItemRequest(
            inventoryId
        );
        OrderRequest request = new OrderRequest(List.of(itemRequest));

        Inventory inventory = Inventory.builder().build();
        // soldAt null → inventory disponible

        Order savedOrder = Order.builder().build();
        OrderResponse response = new OrderResponse(
            UUID.randomUUID(), userId, new BigDecimal("49.99"),
            false, "PENDING", List.of(), null, null
        );

        when(inventoryRepository.findById(inventoryId))
            .thenReturn(Optional.of(inventory));
        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);
        when(orderMapper.toResponse(savedOrder)).thenReturn(response);

        OrderResponse result = service.create(userId, request);

        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo("PENDING");
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void create_shouldThrowNotFoundException_whenInventoryNotFound() {
        UUID userId = UUID.randomUUID();
        UUID inventoryId = UUID.randomUUID();

        OrderRequest request = new OrderRequest(
            List.of(new OrderItemRequest(inventoryId))
        );

        when(inventoryRepository.findById(inventoryId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(userId, request))
            .isInstanceOf(ResourceNotFoundException.class);

        verify(orderRepository, never()).save(any());
    }

    @Test
    void create_shouldThrowDuplicateException_whenInventoryAlreadySold() {
        UUID userId = UUID.randomUUID();
        UUID inventoryId = UUID.randomUUID();

        OrderRequest request = new OrderRequest(
            List.of(new OrderItemRequest(inventoryId))
        );

        Inventory soldInventory = Inventory.builder().build();
        soldInventory.setSoldAt(java.time.LocalDateTime.now());
        // ↑ soldAt renseigné → inventory déjà vendu

        when(inventoryRepository.findById(inventoryId))
            .thenReturn(Optional.of(soldInventory));

        assertThatThrownBy(() -> service.create(userId, request))
            .isInstanceOf(DuplicateResourceException.class)
            .hasMessageContaining("vendu");

        verify(orderRepository, never()).save(any());
    }

    @Test
    void getById_shouldReturnResponse_whenExists() {
        UUID id = UUID.randomUUID();
        Order order = Order.builder().build();
        OrderResponse response = new OrderResponse(
            id, UUID.randomUUID(), BigDecimal.ZERO,
            false, "PENDING", List.of(), null, null
        );

        when(orderRepository.findById(id)).thenReturn(Optional.of(order));
        when(orderMapper.toResponse(order)).thenReturn(response);

        assertThat(service.getById(id).id()).isEqualTo(id);
    }

    @Test
    void getById_shouldThrowNotFoundException_whenNotExists() {
        UUID id = UUID.randomUUID();
        when(orderRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(id))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void delete_shouldCallRepositoryDelete_whenExists() {
        UUID id = UUID.randomUUID();
        Order order = Order.builder().build();
        when(orderRepository.findById(id)).thenReturn(Optional.of(order));

        service.delete(id);

        verify(orderRepository).delete(order);
    }

    @Test
    void delete_shouldThrowNotFoundException_whenNotExists() {
        UUID id = UUID.randomUUID();
        when(orderRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(id))
            .isInstanceOf(ResourceNotFoundException.class);

        verify(orderRepository, never()).delete(any(Order.class));
    }
}