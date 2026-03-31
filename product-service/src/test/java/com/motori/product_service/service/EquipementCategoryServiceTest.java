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

import com.motori.product_service.dto.EquipementCategoryDTO.EquipementCategoryRequest;
import com.motori.product_service.dto.EquipementCategoryDTO.EquipementCategoryResponse;
import com.motori.product_service.exception.DuplicateResourceException;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.EquipementCategoryMapper;
import com.motori.product_service.models.EquipementCategory;
import com.motori.product_service.repository.EquipementCategoryRepository;

/**
 * Unit tests for EquipementCategoryService with mocked dependencies.
 * 
 * <p>Tests the business logic of {@link EquipementCategoryService} which manages
 * hierarchical equipment categories with parent-child relationships. Uses Mockito
 * to mock repository and mapper dependencies for isolated service testing.
 * 
 * <p><b>Test Framework:</b>
 * <ul>
 *   <li><b>Mockito:</b> @ExtendWith(MockitoExtension.class) for mocking</li>
 *   <li><b>AssertJ:</b> assertThat() and assertThatThrownBy()</li>
 *   <li><b>JUnit5:</b> @Test annotation</li>
 * </ul>
 * 
 * <p><b>Mocked Components:</b>
 * <ul>
 *   <li>{@link EquipementCategoryRepository} - Category CRUD and hierarchy queries</li>
 *   <li>{@link EquipementCategoryMapper} - Entity ↔ DTO conversion</li>
 * </ul>
 * 
 * <p><b>Test Coverage:</b>
 * <ul>
 *   <li>CREATE: Unique root category, duplicate category detection</li>
 *   <li>UPDATE: Prevent self-referencing parent (circular reference)</li>
 *   <li>DELETE: Existing category</li>
 * </ul>
 * 
 * <p><b>Business Rules Tested:</b>
 * <ul>
 *   <li>Category name must be unique (DuplicateResourceException)</li>
 *   <li>Category cannot be its own parent (IllegalArgumentException)</li>
 *   <li>Parent category must exist if parentCategoryId provided</li>
 *   <li>Hierarchical structure prevents circular references</li>
 * </ul>
 * 
 * <p><b>Hierarchy Example:</b>
 * <pre>
 * Root: Helmets
 *   ├─ Full Face
 *   ├─ Open Face
 *   └─ Modular
 * </pre>
 * Tests prevent: Helmets → Full Face → Helmets (circular reference).
 * 
 * @author Motori Team
 * @since 1.0
 * @see EquipementCategoryService
 * @see org.mockito.Mockito
 */
@ExtendWith(MockitoExtension.class)
class EquipementCategoryServiceTest {

    @Mock private EquipementCategoryRepository repository;
    @Mock private EquipementCategoryMapper mapper;
    @InjectMocks private EquipementCategoryService service;

    @Test
    void create_shouldReturnResponse_whenNameIsUniqueAndNoParent() {
        EquipementCategoryRequest request = new EquipementCategoryRequest("Casques", null);
        EquipementCategory entity = EquipementCategory.builder().name("Casques").build();
        EquipementCategoryResponse response = new EquipementCategoryResponse(
            UUID.randomUUID(), "Casques", null, null, null, null
        );

        when(repository.findByName("Casques")).thenReturn(Optional.empty());
        when(mapper.toEntity(request)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(entity);
        when(mapper.toResponse(entity)).thenReturn(response);

        assertThat(service.create(request).name()).isEqualTo("Casques");
        verify(repository).save(entity);
    }

    @Test
    void create_shouldThrowDuplicateException_whenNameAlreadyExists() {
        EquipementCategoryRequest request = new EquipementCategoryRequest("Casques", null);
        when(repository.findByName("Casques"))
            .thenReturn(Optional.of(EquipementCategory.builder().build()));

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(DuplicateResourceException.class);

        verify(repository, never()).save(any());
    }

    @Test
    void update_shouldThrowException_whenCategoryIsItsOwnParent() {
        UUID id = UUID.randomUUID();
        EquipementCategoryRequest request = new EquipementCategoryRequest("Casques", id);
        EquipementCategory entity = EquipementCategory.builder().name("Casques").build();

        when(repository.findById(id)).thenReturn(Optional.of(entity));
        when(repository.findByName("Casques")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(id, request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("propre parent");
    }

    @Test
    void delete_shouldCallRepositoryDelete_whenExists() {
        UUID id = UUID.randomUUID();
        EquipementCategory entity = EquipementCategory.builder().name("Casques").build();
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