package com.motori.backoffice_service.controller;

import com.motori.backoffice_service.dto.OrderDto;
import com.motori.order.model.OrderStatus;
import com.motori.backoffice_service.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Commandes", description = "Suivi et gestion des commandes")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Liste paginée de toutes les commandes")
    public Page<OrderDto> findAll(@PageableDefault(page = 0, size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return orderService.findAll(pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'une commande par ID (UUID)")
    public OrderDto findById(@PathVariable UUID id) {
        return orderService.findById(id);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Commandes d'un utilisateur (paginated)")
    public Page<OrderDto> findByUserId(@PathVariable String userId, @PageableDefault(page = 0, size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return orderService.findByUserId(userId, pageable);
    }

    @GetMapping("/user/{userId}/all")
    @Operation(summary = "Toutes les commandes d'un utilisateur (suivi)")
    public List<OrderDto> findAllByUserId(@PathVariable String userId) {
        return orderService.findByUserId(userId);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Commandes par statut")
    public Page<OrderDto> findByStatus(@PathVariable OrderStatus status, @PageableDefault(page = 0, size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return orderService.findByStatus(status, pageable);
    }

    @GetMapping("/search")
    @Operation(summary = "Recherche avec filtres (tracking, statut, dates)")
    public Page<OrderDto> search(
            @RequestParam(name = "trackingNumber", required = false) String trackingNumber,
            @RequestParam(name = "status", required = false) OrderStatus status,
            @RequestParam(name = "userId", required = false) String userId,
            @RequestParam(name = "fromDate", required = false) java.time.LocalDate fromDate,
            @RequestParam(name = "toDate", required = false) java.time.LocalDate toDate,
            @PageableDefault(page = 0, size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return orderService.search(trackingNumber, status, userId, fromDate, toDate, pageable);
    }

    @GetMapping("/recent")
    @Operation(summary = "Dernières commandes (pour tableau de bord)")
    public List<OrderDto> findRecent(@RequestParam(name = "limit", defaultValue = "10") int limit) {
        return orderService.findRecent(limit);
    }

    @GetMapping("/export")
    @Operation(summary = "Export des commandes (CSV ou JSON)")
    public ResponseEntity<?> export(
            @RequestParam(name = "format", defaultValue = "csv") String format,
            @RequestParam(name = "status", required = false) OrderStatus status,
            @RequestParam(name = "fromDate", required = false) java.time.LocalDate fromDate,
            @RequestParam(name = "toDate", required = false) java.time.LocalDate toDate) {
        return orderService.export(format, status, fromDate, toDate);
    }

    @PatchMapping("/{id}/tracking")
    @Operation(summary = "Mettre à jour le suivi (numéro de colis, statut)")
    public OrderDto updateTracking(@PathVariable UUID id, @Valid @RequestBody OrderDto.UpdateTrackingRequest request) {
        return orderService.updateTracking(id, request);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Changer le statut d'une commande")
    public OrderDto updateStatus(@PathVariable UUID id, @RequestParam(name = "status") OrderStatus status) {
        return orderService.updateStatus(id, status);
    }
}