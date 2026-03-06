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

import com.motori.product_service.dto.CompatibilityDTO.CompatibilityRequest;
import com.motori.product_service.dto.CompatibilityDTO.CompatibilityResponse;
import com.motori.product_service.exception.DuplicateResourceException;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.CompatibilityMapper;
import com.motori.product_service.models.Compatibility;
import com.motori.product_service.models.Parts;
import com.motori.product_service.models.Vehicule;
import com.motori.product_service.repository.CompatibilityRepository;
import com.motori.product_service.repository.PartRepository;
import com.motori.product_service.repository.VehiculeRepository;

@ExtendWith(MockitoExtension.class)
class CompatibilityServiceTest {

    @Mock private CompatibilityRepository repository;
    @Mock private PartRepository partRepository;
    @Mock private VehiculeRepository vehiculeRepository;
    @Mock private CompatibilityMapper mapper;
    @InjectMocks private CompatibilityService service;

    @Test
    void create_shouldReturnResponse_whenValid() {
        UUID partId = UUID.randomUUID();
        UUID vehiculeId = UUID.randomUUID();
        CompatibilityRequest request = new CompatibilityRequest(partId, vehiculeId);

        Parts part = Parts.builder().name("Filtre").build();
        Vehicule vehicule = Vehicule.builder().name("Honda CBR").build();
        Compatibility entity = Compatibility.builder().build();
        CompatibilityResponse response = new CompatibilityResponse(
            UUID.randomUUID(), null, null, null, null
        );

        when(partRepository.findById(partId)).thenReturn(Optional.of(part));
        when(vehiculeRepository.findById(vehiculeId)).thenReturn(Optional.of(vehicule));
        when(repository.findByPartIdAndVehiculeId(partId, vehiculeId))
            .thenReturn(Optional.empty());
        when(mapper.toEntity(request)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(entity);
        when(mapper.toResponse(entity)).thenReturn(response);

        CompatibilityResponse result = service.create(request);

        assertThat(result).isNotNull();
        verify(repository).save(entity);
    }

    @Test
    void create_shouldThrowDuplicateException_whenCompatibilityAlreadyExists() {
        UUID partId = UUID.randomUUID();
        UUID vehiculeId = UUID.randomUUID();
        CompatibilityRequest request = new CompatibilityRequest(partId, vehiculeId);

        when(partRepository.findById(partId))
            .thenReturn(Optional.of(Parts.builder().build()));
        when(vehiculeRepository.findById(vehiculeId))
            .thenReturn(Optional.of(Vehicule.builder().build()));
        when(repository.findByPartIdAndVehiculeId(partId, vehiculeId))
            .thenReturn(Optional.of(Compatibility.builder().build()));

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(DuplicateResourceException.class);

        verify(repository, never()).save(any());
    }

    @Test
    void create_shouldThrowNotFoundException_whenPartNotFound() {
        UUID partId = UUID.randomUUID();
        CompatibilityRequest request = new CompatibilityRequest(partId, UUID.randomUUID());

        when(partRepository.findById(partId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void delete_shouldCallRepositoryDelete_whenExists() {
        UUID id = UUID.randomUUID();
        Compatibility entity = Compatibility.builder().build();
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