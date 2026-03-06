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

import com.motori.product_service.dto.PartCategoryDTO.PartCategoryRequest;
import com.motori.product_service.dto.PartCategoryDTO.PartCategoryResponse;
import com.motori.product_service.exception.DuplicateResourceException;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.PartCategoryMapper;
import com.motori.product_service.models.PartCategory;
import com.motori.product_service.repository.PartCategoryRepository;

@ExtendWith(MockitoExtension.class)
class PartCategoryServiceTest {

    @Mock private PartCategoryRepository repository;
    @Mock private PartCategoryMapper mapper;
    @InjectMocks private PartCategoryService service;

    @Test
    void create_shouldReturnResponse_whenNameIsUniqueAndNoParent() {
        PartCategoryRequest request = new PartCategoryRequest("Moteur", null);
        PartCategory entity = PartCategory.builder().name("Moteur").build();
        PartCategoryResponse response = new PartCategoryResponse(
            UUID.randomUUID(), "Moteur", null, null, null, null
        );

        when(repository.findByName("Moteur")).thenReturn(Optional.empty());
        when(mapper.toEntity(request)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(entity);
        when(mapper.toResponse(entity)).thenReturn(response);

        PartCategoryResponse result = service.create(request);

        assertThat(result.name()).isEqualTo("Moteur");
        verify(repository).save(entity);
    }

    @Test
    void create_shouldSetParent_whenParentCategoryIdProvided() {
        UUID parentId = UUID.randomUUID();
        PartCategoryRequest request = new PartCategoryRequest("Filtres", parentId);
        PartCategory parent = PartCategory.builder().name("Moteur").build();
        PartCategory entity = PartCategory.builder().name("Filtres").build();
        PartCategoryResponse response = new PartCategoryResponse(
            UUID.randomUUID(), "Filtres", parentId, "Moteur", null, null
        );

        when(repository.findByName("Filtres")).thenReturn(Optional.empty());
        when(repository.findById(parentId)).thenReturn(Optional.of(parent));
        when(mapper.toEntity(request)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(entity);
        when(mapper.toResponse(entity)).thenReturn(response);

        PartCategoryResponse result = service.create(request);

        assertThat(result.parentCategoryId()).isEqualTo(parentId);
        verify(repository).save(entity);
    }

    @Test
    void create_shouldThrowDuplicateException_whenNameAlreadyExists() {
        PartCategoryRequest request = new PartCategoryRequest("Moteur", null);
        when(repository.findByName("Moteur"))
            .thenReturn(Optional.of(PartCategory.builder().build()));

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(DuplicateResourceException.class);

        verify(repository, never()).save(any());
    }

    @Test
    void create_shouldThrowNotFoundException_whenParentNotFound() {
        UUID parentId = UUID.randomUUID();
        PartCategoryRequest request = new PartCategoryRequest("Filtres", parentId);

        when(repository.findByName("Filtres")).thenReturn(Optional.empty());
        when(repository.findById(parentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void update_shouldThrowException_whenCategoryIsItsOwnParent() {
        UUID id = UUID.randomUUID();
        PartCategoryRequest request = new PartCategoryRequest("Moteur", id);
        PartCategory entity = PartCategory.builder().name("Moteur").build();

        when(repository.findById(id)).thenReturn(Optional.of(entity));
        when(repository.findByName("Moteur")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(id, request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("propre parent");
    }

    @Test
    void delete_shouldCallRepositoryDelete_whenExists() {
        UUID id = UUID.randomUUID();
        PartCategory entity = PartCategory.builder().name("Moteur").build();
        when(repository.findById(id)).thenReturn(Optional.of(entity));

        service.delete(id);

        verify(repository).delete(entity);
    }
}