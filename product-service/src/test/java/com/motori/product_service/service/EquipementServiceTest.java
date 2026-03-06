package com.motori.product_service.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import com.motori.product_service.dto.EquipementDTO.EquipementFilterRequest;
import com.motori.product_service.dto.EquipementDTO.EquipementRequest;
import com.motori.product_service.dto.EquipementDTO.EquipementResponse;
import com.motori.product_service.enums.EquipementSize;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.EquipementMapper;
import com.motori.product_service.models.Equipement;
import com.motori.product_service.models.EquipementBrand;
import com.motori.product_service.models.EquipementCategory;
import com.motori.product_service.repository.EquipementBrandRepository;
import com.motori.product_service.repository.EquipementCategoryRepository;
import com.motori.product_service.repository.EquipementRepository;

@ExtendWith(MockitoExtension.class)
class EquipementServiceTest {

    @Mock private EquipementRepository repository;
    @Mock private EquipementBrandRepository equipementBrandRepository;
    @Mock private EquipementCategoryRepository equipementCategoryRepository;
    @Mock private EquipementMapper mapper;
    @InjectMocks private EquipementService service;

    // ─── CREATE ───────────────────────────────────────────────

    @Test
    void create_shouldReturnResponse_whenValid() {
        UUID brandId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();
        EquipementRequest request = new EquipementRequest(
            EquipementSize.L, "Noir", "Casque intégral",
            "Description", new BigDecimal("299.99"), brandId, categoryId
        );

        EquipementBrand brand = EquipementBrand.builder().name("Shoei").build();
        EquipementCategory category = EquipementCategory.builder().name("Casques").build();
        Equipement entity = Equipement.builder().name("Casque intégral").build();
        EquipementResponse response = new EquipementResponse(
            UUID.randomUUID(), "L", "Noir", "Casque intégral",
            "Description", new BigDecimal("299.99"), null, null, null, null,null
        );

        when(equipementBrandRepository.findById(brandId)).thenReturn(Optional.of(brand));
        when(equipementCategoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(mapper.toEntity(request)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(entity);
        when(mapper.toResponse(entity)).thenReturn(response);

        EquipementResponse result = service.create(request);

        assertThat(result.name()).isEqualTo("Casque intégral");
        verify(repository).save(entity);
    }

    @Test
    void create_shouldThrowNotFoundException_whenBrandNotFound() {
        UUID brandId = UUID.randomUUID();
        EquipementRequest request = new EquipementRequest(
            EquipementSize.L, "Noir", "Casque",
            null, new BigDecimal("299.99"), brandId, UUID.randomUUID()
        );

        when(equipementBrandRepository.findById(brandId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining(brandId.toString());

        verify(repository, never()).save(any());
    }

    @Test
    void create_shouldThrowNotFoundException_whenCategoryNotFound() {
        UUID brandId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();
        EquipementRequest request = new EquipementRequest(
            EquipementSize.L, "Noir", "Casque",
            null, new BigDecimal("299.99"), brandId, categoryId
        );

        when(equipementBrandRepository.findById(brandId))
            .thenReturn(Optional.of(EquipementBrand.builder().build()));
        when(equipementCategoryRepository.findById(categoryId))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining(categoryId.toString());
    }

    // ─── GET ALL avec filtres ──────────────────────────────────

    @Test
    void getAll_shouldReturnPage_whenNoFilters() {
        EquipementFilterRequest filter = new EquipementFilterRequest(
            null, null, null, null, null, null
        );
        PageRequest pageable = PageRequest.of(0, 20);
        Equipement entity = Equipement.builder().name("Casque").build();
        EquipementResponse response = new EquipementResponse(
            UUID.randomUUID(), "L", "Noir", "Casque",
            null, new BigDecimal("299.99"), null, null, null, null,null
        );

        when(repository.findAll(any(Specification.class), eq(pageable)))
            .thenReturn(new PageImpl<>(List.of(entity)));
        when(mapper.toResponse(entity)).thenReturn(response);

        Page<EquipementResponse> result = service.getAll(filter, pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(repository).findAll(any(Specification.class), eq(pageable));
    }

    @Test
    void getAll_shouldReturnPage_whenFilterBySize() {
        EquipementFilterRequest filter = new EquipementFilterRequest(
            null, null, null, null, null, "L"
        );
        PageRequest pageable = PageRequest.of(0, 20);

        when(repository.findAll(any(Specification.class), eq(pageable)))
            .thenReturn(Page.empty());

        Page<EquipementResponse> result = service.getAll(filter, pageable);

        assertThat(result).isEmpty();
        verify(repository).findAll(any(Specification.class), eq(pageable));
    }

    // ─── GET BY ID ────────────────────────────────────────────

    @Test
    void getById_shouldReturnResponse_whenExists() {
        UUID id = UUID.randomUUID();
        Equipement entity = Equipement.builder().name("Casque").build();
        EquipementResponse response = new EquipementResponse(
            id, "L", "Noir", "Casque",
            null, new BigDecimal("299.99"), null, null, null, null, null
        );

        when(repository.findById(id)).thenReturn(Optional.of(entity));
        when(mapper.toResponse(entity)).thenReturn(response);

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
    Equipement entity = Equipement.builder().name("Casque").build();
    when(repository.findById(id)).thenReturn(Optional.of(entity));

    service.delete(id);

    verify(repository).delete(any(Equipement.class));  // ← changer
}

@Test
void delete_shouldThrowNotFoundException_whenNotExists() {
    UUID id = UUID.randomUUID();
    when(repository.findById(id)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.delete(id))
        .isInstanceOf(ResourceNotFoundException.class);

    verify(repository, never()).delete(any(Equipement.class));  // ← changer
}
}