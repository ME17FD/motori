package com.motori.backoffice_service.controller;

import com.motori.backoffice_service.dto.OrderDto;
import com.motori.order.model.OrderStatus;
import com.motori.backoffice_service.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    public Page<OrderDto> findAll(@PageableDefault(size = 20) Pageable pageable) {
        return orderService.findAll(pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'une commande par ID (UUID)")
    public OrderDto findById(@PathVariable UUID id) {
        return orderService.findById(id);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Commandes d'un utilisateur (paginated)")
    public Page<OrderDto> findByUserId(@PathVariable Long userId, @PageableDefault(size = 20) Pageable pageable) {
        return orderService.findByUserId(userId, pageable);
    }

    @GetMapping("/user/{userId}/all")
    @Operation(summary = "Toutes les commandes d'un utilisateur (suivi)")
    public List<OrderDto> findAllByUserId(@PathVariable Long userId) {
        return orderService.findByUserId(userId);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Commandes par statut")
    public Page<OrderDto> findByStatus(@PathVariable OrderStatus status, @PageableDefault(size = 20) Pageable pageable) {
        return orderService.findByStatus(status, pageable);
    }

    @GetMapping("/search")
    @Operation(summary = "Recherche avec filtres (tracking, statut, dates)")
    public Page<OrderDto> search(
            @RequestParam(required = false) String trackingNumber,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) java.time.LocalDate fromDate,
            @RequestParam(required = false) java.time.LocalDate toDate,
            @PageableDefault(size = 20) Pageable pageable) {
        return orderService.search(trackingNumber, status, userId, fromDate, toDate, pageable);
    }

    @GetMapping("/recent")
    @Operation(summary = "Dernières commandes (pour tableau de bord)")
    public List<OrderDto> findRecent(@RequestParam(defaultValue = "10") int limit) {
        return orderService.findRecent(limit);
    }

    @GetMapping("/export")
    @Operation(summary = "Export des commandes (CSV ou JSON)")
    public ResponseEntity<?> export(
            @RequestParam(defaultValue = "csv") String format,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) java.time.LocalDate fromDate,
            @RequestParam(required = false) java.time.LocalDate toDate) {
        return orderService.export(format, status, fromDate, toDate);
    }

    @PatchMapping("/{id}/tracking")
    @Operation(summary = "Mettre à jour le suivi (numéro de colis, statut)")
    public OrderDto updateTracking(@PathVariable UUID id, @Valid @RequestBody OrderDto.UpdateTrackingRequest request) {
        return orderService.updateTracking(id, request);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Changer le statut d'une commande")
    public OrderDto updateStatus(@PathVariable UUID id, @RequestParam OrderStatus status) {
        return orderService.updateStatus(id, status);
    }
}
