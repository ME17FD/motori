package com.motori.product_service.controller;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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

import com.motori.product_service.dto.PartDTO.PartFilterRequest;
import com.motori.product_service.dto.PartDTO.PartRequest;
import com.motori.product_service.dto.PartDTO.PartResponse;
import com.motori.product_service.service.PartService;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/parts")
@RequiredArgsConstructor
public class PartController {

    private final PartService service;

    @PostMapping
    public ResponseEntity<PartResponse> create(
            @RequestBody @Valid PartRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PartResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    public ResponseEntity<Page<PartResponse>> getAll(
        @RequestParam(required = false) String name,
        @RequestParam(required = false) UUID brandId,
        @RequestParam(required = false) UUID categoryId,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice,
        @RequestParam(required = false) UUID vehiculeId,
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
        Pageable pageable) {
        PartFilterRequest filter = new PartFilterRequest(
            name, brandId, categoryId, minPrice, maxPrice, vehiculeId
        );
        return ResponseEntity.ok(service.getAll(filter, pageable));
    }


    @PutMapping("/{id}")
    public ResponseEntity<PartResponse> update(
            @PathVariable UUID id,
            @RequestBody @Valid PartRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/image")
    @Operation(summary = "Uploader une image pour une pièce")
    public ResponseEntity<PartResponse> uploadImage(
        @PathVariable UUID id,
        @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(service.uploadImage(id, file));
    }

    @DeleteMapping("/{id}/image")
    @Operation(summary = "Supprimer l'image d'une pièce")
    public ResponseEntity<PartResponse> deleteImage(@PathVariable UUID id) {
        return ResponseEntity.ok(service.deleteImage(id));
    }
}
