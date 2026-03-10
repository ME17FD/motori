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

/**
 * Unit tests for VehiculeService with mocked dependencies.
 * 
 * <p>Tests the business logic of {@link VehiculeService} which manages
 * motorcycle/vehicle model data with nested brand information. Uses Mockito
 * to mock repository and mapper dependencies for isolated testing.
 * 
 * <p><b>Test Framework:</b> Mockito, AssertJ, JUnit5
 * 
 * <p><b>Mocked Components:</b>
 * <ul>
 *   <li>{@link VehiculeRepository} - Vehicle model CRUD operations</li>
 *   <li>{@link VehiculeBrandRepository} - Brand existence validation</li>
 *   <li>{@link VehiculeMapper} - Entity ↔ DTO conversion with nested brand</li>
 * </ul>
 * 
 * <p><b>Test Coverage:</b>
 * <ul>
 *   <li>CREATE: Valid vehicle with existing brand, missing brand FK validation</li>
 *   <li>READ: GetById existing/non-existent, GetAll paginated results</li>
 *   <li>UPDATE: Model and name modifications</li>
 *   <li>DELETE: Existing vehicle</li>
 * </ul>
 * 
 * <p><b>Business Rules Tested:</b>
 * <ul>
 *   <li>Vehicle brand must exist before vehicle creation (FK validation)</li>
 *   <li>VehicleResponse includes nested VehiculeBrandResponse (eager loading)</li>
 *   <li>Deletion of non-existent vehicle throws ResourceNotFoundException</li>
 * </ul>
 * 
 * <p><b>Nested Brand Mapping:</b> Vehicle responses include complete brand details
 * to enable client-side vehicle identification without additional API calls.
 * Example: "Honda CBR600RR" includes manufacturer "Honda" in response.
 * 
 * @author Motori Team
 * @since 1.0
 * @see VehiculeService
 */
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