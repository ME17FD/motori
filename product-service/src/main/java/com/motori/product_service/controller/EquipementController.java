package com.motori.product_service.controller;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import com.motori.product_service.dto.EquipementDTO.EquipementFilterRequest;
import com.motori.product_service.dto.EquipementDTO.EquipementRequest;
import com.motori.product_service.dto.EquipementDTO.EquipementResponse;
import com.motori.product_service.service.EquipementService;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/equipements")
@RequiredArgsConstructor
public class EquipementController {

    private final EquipementService service;

    @PostMapping
    public ResponseEntity<EquipementResponse> create(
            @RequestBody @Valid EquipementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipementResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    public ResponseEntity<Page<EquipementResponse>> getAll(
        @RequestParam(required = false) String name,
        @RequestParam(required = false) UUID brandId,
        @RequestParam(required = false) UUID categoryId,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice,
        @RequestParam(required = false) String size,
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
        Pageable pageable) {

        EquipementFilterRequest filter = new EquipementFilterRequest(
            name, brandId, categoryId, minPrice, maxPrice, size
        );
        return ResponseEntity.ok(service.getAll(filter, pageable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipementResponse> update(
            @PathVariable UUID id,
            @RequestBody @Valid EquipementRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/image")
    @Operation(summary = "Uploader une image pour un équipement")
    public ResponseEntity<EquipementResponse> uploadImage(
        @PathVariable UUID id,
        @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(service.uploadImage(id, file));
    }

    @DeleteMapping("/{id}/image")
    @Operation(summary = "Supprimer l'image d'un équipement")
    public ResponseEntity<EquipementResponse> deleteImage(@PathVariable UUID id) {
        return ResponseEntity.ok(service.deleteImage(id));
    }

    @PatchMapping("/{id}/properties")
    public ResponseEntity<EquipementResponse> updateProperties(
        @PathVariable UUID id,
        @RequestBody Map<String, Object> properties) {
        return ResponseEntity.ok(service.updateProperties(id, properties));
    }
} 
