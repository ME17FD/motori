package com.motori.product_service.controller;

import java.util.UUID;

import org.apache.hc.core5.http.HttpStatus;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;


import com.motori.product_service.dto.PartBrandDTO.PartBrandRequest;
import com.motori.product_service.dto.PartBrandDTO.PartBrandResponse;
import com.motori.product_service.service.PartBrandService;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/part-brands")
@RequiredArgsConstructor
public class PartBrandController {

    private final PartBrandService service;

    @PostMapping
    public ResponseEntity<PartBrandResponse> create(
            @RequestBody @Valid PartBrandRequest request) {
        return ResponseEntity.status(HttpStatus.SC_CREATED).body(service.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PartBrandResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    public ResponseEntity<Page<PartBrandResponse>> getAll(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(service.getAll(pageable));
    }


    @PutMapping("/{id}")
    public ResponseEntity<PartBrandResponse> update(
            @PathVariable UUID id,
            @RequestBody @Valid PartBrandRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
} 
