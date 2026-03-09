package com.motori.product_service.controller;

import java.util.List;
import java.util.UUID;

import org.apache.hc.core5.http.HttpStatus;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import com.motori.product_service.dto.VehiculeBrandDTO.VehiculeBrandRequest;
import com.motori.product_service.dto.VehiculeBrandDTO.VehiculeBrandResponse;
import com.motori.product_service.service.VehiculeBrandService;



import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/vehicule-brands")
@RequiredArgsConstructor
public class VehiculeBrandController {

    private final VehiculeBrandService service;

    @PostMapping
    public ResponseEntity<VehiculeBrandResponse> create(
            @RequestBody @Valid VehiculeBrandRequest request) {
        // @Valid → déclenche la validation (@NotBlank, @NotNull...)
        // Si invalide → MethodArgumentNotValidException → 400 via GlobalExceptionHandler
        return ResponseEntity
            .status(HttpStatus.SC_CREATED)      // 201
            .body(service.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehiculeBrandResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id)); // 200
    }

    @GetMapping
    public ResponseEntity<Page<VehiculeBrandResponse>> getAll(
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
        Pageable pageable) {
            List<VehiculeBrandResponse> all = service.getAll();
            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), all.size());
            List<VehiculeBrandResponse> pageContent = start >= all.size()
                ? List.of()
                : all.subList(start, end);
        return ResponseEntity.ok(new PageImpl<>(pageContent, pageable, all.size()));
    }


    @PutMapping("/{id}")
    public ResponseEntity<VehiculeBrandResponse> update(
            @PathVariable UUID id,
            @RequestBody @Valid VehiculeBrandRequest request) {
        return ResponseEntity.ok(service.update(id, request)); // 200
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build(); // 204
    }
} 
