package com.motori.product_service.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import com.motori.product_service.dto.PartDTO.PartFilterRequest;
import com.motori.product_service.dto.PartDTO.PartRequest;
import com.motori.product_service.dto.PartDTO.PartResponse;
import com.motori.product_service.exception.DuplicateResourceException;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.PartMapper;
import com.motori.product_service.models.PartBrand;
import com.motori.product_service.models.PartCategory;
import com.motori.product_service.models.Parts;
import com.motori.product_service.repository.PartBrandRepository;
import com.motori.product_service.repository.PartCategoryRepository;
import com.motori.product_service.repository.PartRepository;

@ExtendWith(MockitoExtension.class)
class PartServiceTest {

    @Mock private PartRepository repository;
    @Mock private PartBrandRepository partBrandRepository;
    @Mock private PartCategoryRepository partCategoryRepository;
    @Mock private PartMapper mapper;
    @InjectMocks private PartService service;

    // ─── CREATE ───────────────────────────────────────────────

    @Test
    void create_shouldReturnResponse_whenValid() {
        UUID brandId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();

        PartRequest request = new PartRequest(
            "Filtre à huile", "FA-001", "Description",
            new BigDecimal("15.99"), brandId, categoryId,null
        );

        PartBrand brand = PartBrand.builder().name("Bosch").build();
        PartCategory category = PartCategory.builder().name("Filtres").build();
        Parts part = Parts.builder().name("Filtre à huile").ref("FA-001").build();
        PartResponse response = new PartResponse(
            UUID.randomUUID(), "Filtre à huile", "FA-001",
            "Description", new BigDecimal("15.99"), null, null, null, null,null,null
        );

        when(repository.findByRef("FA-001")).thenReturn(Optional.empty());
        when(partBrandRepository.findById(brandId)).thenReturn(Optional.of(brand));
        when(partCategoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(mapper.toEntity(request)).thenReturn(part);
        when(repository.save(part)).thenReturn(part);
        when(mapper.toResponse(part)).thenReturn(response);

        PartResponse result = service.create(request);

        assertThat(result).isNotNull();
        assertThat(result.ref()).isEqualTo("FA-001");
        verify(repository).save(part);
    }

    @Test
    void create_shouldThrowDuplicateException_whenRefAlreadyExists() {
        PartRequest request = new PartRequest(
            "Filtre", "FA-001", null,
            new BigDecimal("15.99"), UUID.randomUUID(), UUID.randomUUID(),null
        );

        when(repository.findByRef("FA-001"))
            .thenReturn(Optional.of(Parts.builder().build()));

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(DuplicateResourceException.class)
            .hasMessageContaining("FA-001");

        verify(repository, never()).save(any());
    }

    @Test
    void create_shouldThrowNotFoundException_whenBrandNotFound() {
        UUID brandId = UUID.randomUUID();
        PartRequest request = new PartRequest(
            "Filtre", "FA-001", null,
            new BigDecimal("15.99"), brandId, UUID.randomUUID(),null
        );

        when(repository.findByRef("FA-001")).thenReturn(Optional.empty());
        when(partBrandRepository.findById(brandId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining(brandId.toString());
    }

    @Test
    void create_shouldThrowNotFoundException_whenCategoryNotFound() {
        UUID brandId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();
        PartRequest request = new PartRequest(
            "Filtre", "FA-001", null,
            new BigDecimal("15.99"), brandId, categoryId,null
        );

        when(repository.findByRef("FA-001")).thenReturn(Optional.empty());
        when(partBrandRepository.findById(brandId))
            .thenReturn(Optional.of(PartBrand.builder().build()));
        when(partCategoryRepository.findById(categoryId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining(categoryId.toString());
    }

    // ─── GET ALL avec filtres ──────────────────────────────────

    @Test
    void getAll_shouldReturnPage_whenNoFilters() {
        PartFilterRequest filter = new PartFilterRequest(
            null, null, null, null, null, null
        );
        PageRequest pageable = PageRequest.of(0, 20);
        Parts part = Parts.builder().name("Filtre").ref("FA-001").build();
        PartResponse response = new PartResponse(
            UUID.randomUUID(), "Filtre", "FA-001",
            null, new BigDecimal("15.99"), null, null, null, null,null,null
        );

        when(repository.findAll(any(Specification.class), eq(pageable)))
            .thenReturn(new PageImpl<>(java.util.List.of(part)));
        when(mapper.toResponse(part)).thenReturn(response);

        Page<PartResponse> result = service.getAll(filter, pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(repository).findAll(any(Specification.class), eq(pageable));
    }

    @Test
    void getAll_shouldReturnPage_whenFilterByBrand() {
        UUID brandId = UUID.randomUUID();
        PartFilterRequest filter = new PartFilterRequest(
            null, brandId, null, null, null, null
        );
        PageRequest pageable = PageRequest.of(0, 20);

        when(repository.findAll(any(Specification.class), eq(pageable)))
            .thenReturn(Page.empty());

        Page<PartResponse> result = service.getAll(filter, pageable);

        assertThat(result).isEmpty();
        verify(repository).findAll(any(Specification.class), eq(pageable));
    }

    // ─── GET BY ID ────────────────────────────────────────────

    @Test
    void getById_shouldReturnResponse_whenExists() {
        UUID id = UUID.randomUUID();
        Parts part = Parts.builder().name("Filtre").build();
        PartResponse response = new PartResponse(
            id, "Filtre", "FA-001", null,
            new BigDecimal("15.99"), null, null, null, null, null, null
        );

        when(repository.findById(id)).thenReturn(Optional.of(part));
        when(mapper.toResponse(part)).thenReturn(response);

        assertThat(service.getById(id).id()).isEqualTo(id);
    }

    @Test
    void getById_shouldThrowNotFoundException_whenNotExists() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(id))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    // ─── DELETE ───────────────────────────────────────────────

    @Test
    void delete_shouldCallRepositoryDelete_whenExists() {
        UUID id = UUID.randomUUID();
        Parts entity = Parts.builder().name("Filtre").build();
        when(repository.findById(id)).thenReturn(Optional.of(entity));

        service.delete(id);

        verify(repository).delete(any(Parts.class));
    }

    @Test
    void delete_shouldThrowNotFoundException_whenNotExists() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(id))
            .isInstanceOf(ResourceNotFoundException.class);

        verify(repository, never()).delete(any(Parts.class));
    }
}