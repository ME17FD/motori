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
            inventoryId, new BigDecimal("49.99")
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
            List.of(new OrderItemRequest(inventoryId, new BigDecimal("49.99")))
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
            List.of(new OrderItemRequest(inventoryId, new BigDecimal("49.99")))
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