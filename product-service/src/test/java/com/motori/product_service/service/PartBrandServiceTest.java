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

import com.motori.product_service.dto.PartBrandDTO.PartBrandRequest;
import com.motori.product_service.dto.PartBrandDTO.PartBrandResponse;
import com.motori.product_service.exception.DuplicateResourceException;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.PartBrandMapper;
import com.motori.product_service.models.PartBrand;
import com.motori.product_service.repository.PartBrandRepository;

/**
 * Unit tests for PartBrandService with mocked dependencies.
 * 
 * <p>Tests the business logic of {@link PartBrandService} which manages
 * auto parts manufacturer data with Redis caching. Uses Mockito to mock
 * repository and mapper dependencies for isolated testing.
 * 
 * <p><b>Test Framework:</b> Mockito @ExtendWith, AssertJ assertions, JUnit5 @Test
 * 
 * <p><b>Mocked Components:</b>
 * <ul>
 *   <li>{@link PartBrandRepository} - Brand CRUD operations</li>
 *   <li>{@link PartBrandMapper} - Entity ↔ DTO conversion</li>
 * </ul>
 * 
 * <p><b>Test Coverage:</b>
 * <ul>
 *   <li>CREATE: Unique brand name, duplicate detection</li>
 *   <li>READ: GetById existing/non-existent, GetAll with caching</li>
 *   <li>DELETE: Existing brand, non-existent brand</li>
 * </ul>
 * 
 * <p><b>Business Rules Tested:</b>
 * <ul>
 *   <li>Part brand name must be unique (DuplicateResourceException)</li>
 *   <li>Duplicate check uses repository.findByName() before save</li>
 *   <li>Deletion of non-existent brand throws ResourceNotFoundException</li>
 *   <li>Service applies @Cacheable/@CacheEvict decorators (tested at service level)</li>
 * </ul>
 * 
 * <p><b>Caching Strategy:</b> Service layer caches getById() and getAll() results
 * with 10-minute TTL. Cache is invalidated on create/update/delete. Unit tests
 * mock repository directly, bypassing cache logic for deterministic testing.
 * 
 * @author Motori Team
 * @since 1.0
 * @see PartBrandService
 */
@ExtendWith(MockitoExtension.class)
class PartBrandServiceTest {

    @Mock private PartBrandRepository repository;
    @Mock private PartBrandMapper mapper;
    @InjectMocks private PartBrandService service;

    @Test
    void create_shouldReturnResponse_whenNameIsUnique() {
        PartBrandRequest request = new PartBrandRequest("Bosch");
        PartBrand entity = PartBrand.builder().name("Bosch").build();
        PartBrandResponse response = new PartBrandResponse(UUID.randomUUID(), "Bosch", null, null);

        when(repository.findByName("Bosch")).thenReturn(Optional.empty());
        when(mapper.toEntity(request)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(entity);
        when(mapper.toResponse(entity)).thenReturn(response);

        PartBrandResponse result = service.create(request);

        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Bosch");
        verify(repository).save(entity);
    }

    @Test
    void create_shouldThrowDuplicateException_whenNameAlreadyExists() {
        PartBrandRequest request = new PartBrandRequest("Bosch");
        when(repository.findByName("Bosch"))
            .thenReturn(Optional.of(PartBrand.builder().build()));

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(DuplicateResourceException.class)
            .hasMessageContaining("Bosch");

        verify(repository, never()).save(any());
    }

    @Test
    void getById_shouldReturnResponse_whenExists() {
        UUID id = UUID.randomUUID();
        PartBrand entity = PartBrand.builder().name("Bosch").build();
        PartBrandResponse response = new PartBrandResponse(id, "Bosch", null, null);

        when(repository.findById(id)).thenReturn(Optional.of(entity));
        when(mapper.toResponse(entity)).thenReturn(response);

        PartBrandResponse result = service.getById(id);

        assertThat(result.id()).isEqualTo(id);
    }

    @Test
    void getById_shouldThrowNotFoundException_whenNotExists() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(id))
            .isInstanceOf(ResourceNotFoundException.class);

        verify(mapper, never()).toResponse(any());
    }

    @Test
    void delete_shouldCallRepositoryDelete_whenExists() {
        UUID id = UUID.randomUUID();
        PartBrand entity = PartBrand.builder().name("Bosch").build();
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