package com.motori.product_service.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.motori.product_service.dto.VehiculeBrandDTO.VehiculeBrandRequest;
import com.motori.product_service.dto.VehiculeBrandDTO.VehiculeBrandResponse;
import com.motori.product_service.exception.DuplicateResourceException;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.VehiculeBrandMapper;
import com.motori.product_service.models.VehiculeBrand;
import com.motori.product_service.repository.VehiculeBrandRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;
import java.util.UUID;

@ExtendWith(MockitoExtension.class)
class VehiculeBrandServiceTest {

    @Mock
    private VehiculeBrandRepository repository;

    @Mock
    private VehiculeBrandMapper mapper;

    @InjectMocks
    private VehiculeBrandService service;

    // ─── CREATE ───────────────────────────────────────────────

    @Test
    void create_shouldReturnResponse_whenNameIsUnique() {
        // ARRANGE — prépare les données et les comportements mockés
        VehiculeBrandRequest request = new VehiculeBrandRequest("Honda");

        VehiculeBrand entity = VehiculeBrand.builder()
            .name("Honda")
            .build();

        VehiculeBrandResponse response = new VehiculeBrandResponse(
            UUID.randomUUID(), "Honda", null, null
        );

        when(repository.findByName("Honda")).thenReturn(Optional.empty());
        // ↑ simule : le nom n'existe pas encore en base

        when(mapper.toEntity(request)).thenReturn(entity);
        // ↑ simule : le mapper convertit la request en entité

        when(repository.save(entity)).thenReturn(entity);
        // ↑ simule : le repository sauvegarde et retourne l'entité

        when(mapper.toResponse(entity)).thenReturn(response);
        // ↑ simule : le mapper convertit l'entité en response

        // ACT — appelle la méthode à tester
        VehiculeBrandResponse result = service.create(request);

        // ASSERT — vérifie le résultat
        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Honda");

        verify(repository).save(entity);
        // ↑ vérifie que save() a bien été appelé
    }

    @Test
    void create_shouldThrowDuplicateException_whenNameAlreadyExists() {
        // ARRANGE
        VehiculeBrandRequest request = new VehiculeBrandRequest("Honda");

        VehiculeBrand existing = VehiculeBrand.builder()
            .name("Honda")
            .build();

        when(repository.findByName("Honda")).thenReturn(Optional.of(existing));
        // ↑ simule : le nom existe déjà en base

        // ACT + ASSERT
        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(DuplicateResourceException.class)
            .hasMessageContaining("Honda");
        // ↑ vérifie que l'exception est bien levée avec le bon message

        verify(repository, never()).save(any());
        // ↑ vérifie que save() n'a PAS été appelé
    }

    // ─── GET BY ID ────────────────────────────────────────────

    @Test
    void getById_shouldReturnResponse_whenExists() {
        // ARRANGE
        UUID id = UUID.randomUUID();

        VehiculeBrand entity = VehiculeBrand.builder()
            .name("Honda")
            .build();

        VehiculeBrandResponse response = new VehiculeBrandResponse(
            id, "Honda", null, null
        );

        when(repository.findById(id)).thenReturn(Optional.of(entity));
        when(mapper.toResponse(entity)).thenReturn(response);

        // ACT
        VehiculeBrandResponse result = service.getById(id);

        // ASSERT
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(id);
    }

    @Test
    void getById_shouldThrowNotFoundException_whenNotExists() {
        // ARRANGE
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        // ACT + ASSERT
        assertThatThrownBy(() -> service.getById(id))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining(id.toString());

        verify(mapper, never()).toResponse(any());
        // ↑ le mapper ne doit pas être appelé si l'entité n'existe pas
    }

    // ─── UPDATE ───────────────────────────────────────────────

    @Test
    void update_shouldReturnUpdatedResponse_whenValid() {
        // ARRANGE
        UUID id = UUID.randomUUID();
        VehiculeBrandRequest request = new VehiculeBrandRequest("Yamaha");

        VehiculeBrand existing = VehiculeBrand.builder()
            .name("Honda")
            .build();

        VehiculeBrandResponse response = new VehiculeBrandResponse(
            id, "Yamaha", null, null
        );

        when(repository.findById(id)).thenReturn(Optional.of(existing));
        when(repository.findByName("Yamaha")).thenReturn(Optional.empty());
        when(repository.save(existing)).thenReturn(existing);
        when(mapper.toResponse(existing)).thenReturn(response);

        // ACT
        VehiculeBrandResponse result = service.update(id, request);

        // ASSERT
        assertThat(result.name()).isEqualTo("Yamaha");
        verify(repository).save(existing);
    }

    @Test
    void update_shouldThrowDuplicateException_whenNameExistsOnOtherEntity() {
        // ARRANGE
        UUID id = UUID.randomUUID();
        UUID otherId = UUID.randomUUID();

        VehiculeBrandRequest request = new VehiculeBrandRequest("Yamaha");

        VehiculeBrand existing = VehiculeBrand.builder().name("Honda").build();
        ReflectionTestUtils.setField(existing, "id", id);

        VehiculeBrand other = VehiculeBrand.builder().name("Yamaha").build();
        ReflectionTestUtils.setField(other, "id", otherId);
        // ↑ ReflectionTestUtils permet de setter des champs privés dans les tests

        when(repository.findById(id)).thenReturn(Optional.of(existing));
        when(repository.findByName("Yamaha")).thenReturn(Optional.of(other));

        // ACT + ASSERT
        assertThatThrownBy(() -> service.update(id, request))
            .isInstanceOf(DuplicateResourceException.class);

        verify(repository, never()).save(any());
    }

    // ─── DELETE ───────────────────────────────────────────────

    @Test
    void delete_shouldCallRepositoryDelete_whenExists() {
        // ARRANGE
        UUID id = UUID.randomUUID();
        VehiculeBrand entity = VehiculeBrand.builder().name("Honda").build();

        when(repository.findById(id)).thenReturn(Optional.of(entity));

        // ACT
        service.delete(id);

        // ASSERT
        verify(repository).delete(entity);
        // ↑ vérifie que delete() a bien été appelé avec la bonne entité
    }

    @Test
    void delete_shouldThrowNotFoundException_whenNotExists() {
        // ARRANGE
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        // ACT + ASSERT
        assertThatThrownBy(() -> service.delete(id))
            .isInstanceOf(ResourceNotFoundException.class);

        verify(repository, never()).delete(any());
    }
}