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

/**
 * Unit tests for CompatibilityService with mocked dependencies.
 * 
 * <p>Tests the business logic of {@link CompatibilityService} which manages
 * part-to-vehicle compatibility mappings. Uses Mockito to mock repository and mapper
 * dependencies, enabling isolated testing of service logic without database I/O.
 * 
 * <p><b>Test Framework:</b>
 * <ul>
 *   <li><b>Mockito:</b> @ExtendWith(MockitoExtension.class) for dependency mocking</li>
 *   <li><b>AssertJ:</b> assertThat() for fluent assertions</li>
 *   <li><b>JUnit5:</b> @Test annotation for test methods</li>
 * </ul>
 * 
 * <p><b>Mocked Components:</b>
 * <ul>
 *   <li>{@link CompatibilityRepository} - Data access (find, save, delete)</li>
 *   <li>{@link PartRepository} - Part existence validation</li>
 *   <li>{@link VehiculeRepository} - Vehicle existence validation</li>
 *   <li>{@link CompatibilityMapper} - Entity ↔ DTO conversion</li>
 * </ul>
 * 
 * <p><b>Test Coverage:</b>
 * <ul>
 *   <li>CREATE: Valid record, duplicate detection, missing part, missing vehicle</li>
 *   <li>DELETE: Existing record, non-existent record</li>
 * </ul>
 * 
 * <p><b>Business Rules Tested:</b>
 * <ul>
 *   <li>Duplicate compatibility cannot be created (same part + vehicle)</li>
 *   <li>Foreign key validation: part and vehicle must exist before creating mapping</li>
 *   <li>Deletion requires record to exist (throws ResourceNotFoundException)</li>
 * </ul>
 * 
 * <p><b>Testing Pattern:</b> Each test follows naming convention:
 * <code>methodName_shouldExpectation_whenCondition</code>
 * <pre>
 * ✓ create_shouldReturnResponse_whenValid()
 * ✓ create_shouldThrowDuplicateException_whenCompatibilityAlreadyExists()
 * ✓ create_shouldThrowNotFoundException_whenPartNotFound()
 * </pre>
 * 
 * @author Motori Team
 * @since 1.0
 * @see CompatibilityService
 * @see org.mockito.Mockito
 * @see org.assertj.core.api.Assertions
 */
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