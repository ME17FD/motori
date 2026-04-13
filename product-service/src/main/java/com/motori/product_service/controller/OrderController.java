package com.motori.product_service.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import com.motori.product_service.dto.OderDTO.OrderFilterRequest;
import com.motori.product_service.dto.OderDTO.OrderRequest;
import com.motori.product_service.dto.OderDTO.OrderResponse;
import com.motori.product_service.service.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService service;

    @PostMapping
    public ResponseEntity<OrderResponse> create(
            @RequestHeader("X-User-ID") String userId,
            @RequestBody @Valid OrderRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.create(userId, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean completed,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {

        OrderFilterRequest filter = new OrderFilterRequest(status, completed, userId);
        return ResponseEntity.ok(service.getAll(filter, pageable));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<OrderResponse>> getByUserId(
            @PathVariable String userId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(service.getByUserId(userId, pageable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
