package com.motori.product_service.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.motori.product_service.dto.EquipementBrandDTO.EquipementBrandRequest;
import com.motori.product_service.dto.EquipementBrandDTO.EquipementBrandResponse;
import com.motori.product_service.exception.DuplicateResourceException;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.EquipementBrandMapper;
import com.motori.product_service.models.EquipementBrand;
import com.motori.product_service.repository.EquipementBrandRepository;

@ExtendWith(MockitoExtension.class)
class EquipementBrandServiceTest {

    @Mock private EquipementBrandRepository repository;
    @Mock private EquipementBrandMapper mapper;
    @InjectMocks private EquipementBrandService service;

    @Test
    void create_shouldReturnResponse_whenNameIsUnique() {
        EquipementBrandRequest request = new EquipementBrandRequest("Alpinestars");
        EquipementBrand entity = EquipementBrand.builder().name("Alpinestars").build();
        EquipementBrandResponse response = new EquipementBrandResponse(
            UUID.randomUUID(), "Alpinestars", null, null
        );

        when(repository.findByName("Alpinestars")).thenReturn(Optional.empty());
        when(mapper.toEntity(request)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(entity);
        when(mapper.toResponse(entity)).thenReturn(response);

        EquipementBrandResponse result = service.create(request);

        assertThat(result.name()).isEqualTo("Alpinestars");
        verify(repository).save(entity);
    }

    @Test
    void create_shouldThrowDuplicateException_whenNameAlreadyExists() {
        EquipementBrandRequest request = new EquipementBrandRequest("Alpinestars");
        when(repository.findByName("Alpinestars"))
            .thenReturn(Optional.of(EquipementBrand.builder().build()));

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(DuplicateResourceException.class)
            .hasMessageContaining("Alpinestars");

        verify(repository, never()).save(any());
    }

    @Test
    void getById_shouldReturnResponse_whenExists() {
        UUID id = UUID.randomUUID();
        EquipementBrand entity = EquipementBrand.builder().name("Alpinestars").build();
        EquipementBrandResponse response = new EquipementBrandResponse(
            id, "Alpinestars", null, null
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

    @Test
    void delete_shouldCallRepositoryDelete_whenExists() {
        UUID id = UUID.randomUUID();
        EquipementBrand entity = EquipementBrand.builder().name("Alpinestars").build();
        when(repository.findById(id)).thenReturn(Optional.of(entity));

        service.delete(id);

        verify(repository).delete(entity);
    }

    @Test
    void delete_shouldThrowNotFoundException_whenNotExists() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(id))
            .isInstanceOf(ResourceNotFoundException.class);

        verify(repository, never()).delete(any());
    }
}