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

import com.motori.product_service.dto.VehiculeDTO.VehiculeRequest;
import com.motori.product_service.dto.VehiculeDTO.VehiculeResponse;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.VehiculeMapper;
import com.motori.product_service.models.Vehicule;
import com.motori.product_service.models.VehiculeBrand;
import com.motori.product_service.repository.VehiculeBrandRepository;
import com.motori.product_service.repository.VehiculeRepository;

@ExtendWith(MockitoExtension.class)
class VehiculeServiceTest {

    @Mock private VehiculeRepository repository;
    @Mock private VehiculeBrandRepository vehiculeBrandRepository;
    @Mock private VehiculeMapper mapper;
    @InjectMocks private VehiculeService service;

    @Test
    void create_shouldReturnResponse_whenValid() {
        UUID brandId = UUID.randomUUID();
        VehiculeRequest request = new VehiculeRequest("CBR 600", "Honda CBR", brandId);
        VehiculeBrand brand = VehiculeBrand.builder().name("Honda").build();
        Vehicule entity = Vehicule.builder().name("Honda CBR").model("CBR 600").build();
        VehiculeResponse response = new VehiculeResponse(
            UUID.randomUUID(), "CBR 600", "Honda CBR", null, null, null
        );

        when(vehiculeBrandRepository.findById(brandId)).thenReturn(Optional.of(brand));
        when(mapper.toEntity(request)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(entity);
        when(mapper.toResponse(entity)).thenReturn(response);

        VehiculeResponse result = service.create(request);

        assertThat(result).isNotNull();
        assertThat(result.model()).isEqualTo("CBR 600");
        verify(repository).save(entity);
    }

    @Test
    void create_shouldThrowNotFoundException_whenBrandNotFound() {
        UUID brandId = UUID.randomUUID();
        VehiculeRequest request = new VehiculeRequest("CBR 600", "Honda CBR", brandId);

        when(vehiculeBrandRepository.findById(brandId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining(brandId.toString());

        verify(repository, never()).save(any());
    }

    @Test
    void getById_shouldReturnResponse_whenExists() {
        UUID id = UUID.randomUUID();
        Vehicule entity = Vehicule.builder().name("Honda CBR").build();
        VehiculeResponse response = new VehiculeResponse(
            id, "CBR 600", "Honda CBR", null, null, null
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
        Vehicule entity = Vehicule.builder().name("Honda CBR").build();
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