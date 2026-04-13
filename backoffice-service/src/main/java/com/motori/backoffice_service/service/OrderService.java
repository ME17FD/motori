package com.motori.backoffice_service.service;

import com.motori.backoffice_service.dto.OrderDto;
import com.motori.backoffice_service.exception.OrderNotFoundException;
import com.motori.order.model.Order;
import com.motori.order.model.OrderStatus;
import com.motori.backoffice_service.repository.OrderRepository;
import com.motori.backoffice_service.repository.OrderSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public Page<OrderDto> findAll(Pageable pageable) {
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(OrderDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public OrderDto findById(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        return OrderDto.fromEntity(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> findByUserId(String userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(OrderDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> findByUserId(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(OrderDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> findByStatus(OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                .map(OrderDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> search(
            String trackingNumber, OrderStatus status, String userId,
            LocalDate fromDate, LocalDate toDate, Pageable pageable) {
        Specification<Order> spec = OrderSpecification.withFilters(trackingNumber, status, userId, fromDate, toDate);
        return orderRepository.findAll(spec, pageable).map(OrderDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> findRecent(int limit) {
        return orderRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, Math.min(limit, 100)))
                .getContent().stream().map(OrderDto::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public ResponseEntity<?> export(String format, OrderStatus status, LocalDate fromDate, LocalDate toDate) {
        Specification<Order> spec = OrderSpecification.withFilters(null, status, null, fromDate, toDate);
        List<Order> orders = orderRepository.findAll(spec);
        List<OrderDto> dtos = orders.stream().map(OrderDto::fromEntity).toList();

        if ("csv".equalsIgnoreCase(format)) {
            String csv = buildCsv(dtos);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
            headers.setContentDispositionFormData("attachment", "orders_export.csv");
            return new ResponseEntity<>(csv, headers, HttpStatus.OK);
        }
        return ResponseEntity.ok(dtos);
    }

    private static String buildCsv(List<OrderDto> orders) {
        StringBuilder sb = new StringBuilder();
        sb.append("id;userId;status;totalAmount;shippingAddress;trackingNumber;createdAt\n");
        for (OrderDto o : orders) {
            sb.append(o.getId()).append(";")
              .append(o.getUserId()).append(";")
              .append(o.getStatus()).append(";")
              .append(o.getTotalAmount()).append(";")
              .append(escapeCsv(o.getShippingAddress())).append(";")
              .append(escapeCsv(o.getTrackingNumber())).append(";")
              .append(o.getCreatedAt()).append("\n");
        }
        return sb.toString();
    }

    private static String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(";") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    @Transactional
    public OrderDto updateTracking(UUID id, OrderDto.UpdateTrackingRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        if (request.getTrackingNumber() != null) {
            order.setTrackingNumber(request.getTrackingNumber());
        }
        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
        }
        order = orderRepository.save(order);
        return OrderDto.fromEntity(order);
    }

    @Transactional
    public OrderDto updateStatus(UUID id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        order.setStatus(status);
        order = orderRepository.save(order);
        return OrderDto.fromEntity(order);
    }
}
