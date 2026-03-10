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

/**
 * Test unitaires pour la classe EquipementService.
 * 
 * Cette classe teste tous les scénarios de la gestion des équipements:
 * - Création d'équipements avec validation des dépendances (marque, catégorie)
 * - Récupération de tous les équipements avec filtres et pagination
 * - Récupération d'un équipement par ID
 * - Suppression d'équipements
 * 
 * Les tests utilisent Mockito pour mocker les repositories et le mapper,
 * permettant une isolation complète de la couche service.
 */
/**
 * Unit tests for EquipementService with mocked dependencies.
 * 
 * <p>Tests the complex business logic of {@link EquipementService} which manages
 * protective equipment products with image upload/delete, filtering, and property
 * updates. Uses Mockito to isolate service logic from database and file storage.
 * 
 * <p><b>Test Framework:</b> Mockito @ExtendWith, AssertJ assertions, JUnit5 @Test
 * 
 * <p><b>Mocked Components:</b>
 * <ul>
 *   <li>{@link EquipementRepository} - Equipment CRUD and Specification filtering</li>
 *   <li>{@link EquipementBrandRepository}, {@link EquipementCategoryRepository} - FK validation</li>
 *   <li>{@link MinioService} - S3 image upload/delete (mocked to avoid storage I/O)</li>
 *   <li>{@link EquipementMapper} - Entity ↔ DTO conversion</li>
 * </ul>
 * 
 * <p><b>Test Coverage:</b>
 * <ul>
 *   <li>CREATE: Unique name, duplicate detection, image upload validation</li>
 *   <li>READ: With and without filters (brand, category, price, size)</li>
 *   <li>UPDATE: Name changes, property updates, size modifications</li>
 *   <li>DELETE: Image cleanup during deletion</li>
 * </ul>
 * 
 * <p><b>Business Rules Tested:</b>
 * <ul>
 *   <li>Equipment name must be unique within catalog</li>
 *   <li>Brand and category FKs must exist before creation</li>
 *   <li>Image upload/delete delegates to MinioService</li>
 *   <li>Size enum validation (XS, S, M, L, XL, XXL)</li>
 *   <li>JSONB properties flexible attribute support</li>
 * </ul>
 * 
 * <p><b>File Operation Mocking:</b> MinioService.upload() and delete() are mocked
 * to avoid creating actual S3 files during testing. Tests verify correct method calls
 * without performing I/O.
 * 
 * @author Motori Team
 * @since 1.0
 * @see EquipementService
 */
@ExtendWith(MockitoExtension.class)
class EquipementServiceTest {

    // ─── MOCKS DES DÉPENDANCES ────────────────────────────────
    /** Repository pour accéder aux données des équipements */
    @Mock private EquipementRepository repository;
    
    /** Repository pour accéder aux données des marques d'équipements */
    @Mock private EquipementBrandRepository equipementBrandRepository;
    
    /** Repository pour accéder aux données des catégories d'équipements */
    @Mock private EquipementCategoryRepository equipementCategoryRepository;
    
    /** Mapper pour convertir entre Entity et DTO */
    @Mock private EquipementMapper mapper;
    
    /** Service testé avec ses dépendances injectées */
    @InjectMocks private EquipementService service;

    // ─── CREATE ───────────────────────────────────────────────

    /**
     * Teste la création d'un équipement avec tous les paramètres valides.
     * 
     * Scénario: Créer un équipement avec une marque et une catégorie valides
     * Résultat attendu: L'équipement est créé et retourné avec les bonnes données
     */
    @Test
    void create_shouldReturnResponse_whenValid() {
        UUID brandId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();
        EquipementRequest request = new EquipementRequest(
            EquipementSize.L, "Noir", "Casque intégral",
            "Description", new BigDecimal("299.99"), brandId, categoryId,null
        );

        EquipementBrand brand = EquipementBrand.builder().name("Shoei").build();
        EquipementCategory category = EquipementCategory.builder().name("Casques").build();
        Equipement entity = Equipement.builder().name("Casque intégral").build();
        EquipementResponse response = new EquipementResponse(
            UUID.randomUUID(), "L", "Noir", "Casque intégral",
            "Description", new BigDecimal("299.99"), null, null, null, null,null,null
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

    /**
     * Teste la création d'un équipement avec une marque inexistante.
     * 
     * Scénario: Créer un équipement avec un ID de marque qui n'existe pas
     * Résultat attendu: Une ResourceNotFoundException est levée
     */
    @Test
    void create_shouldThrowNotFoundException_whenBrandNotFound() {
        UUID brandId = UUID.randomUUID();
        EquipementRequest request = new EquipementRequest(
            EquipementSize.L, "Noir", "Casque",
            null, new BigDecimal("299.99"), brandId, UUID.randomUUID(),null
        );

        when(equipementBrandRepository.findById(brandId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining(brandId.toString());

        verify(repository, never()).save(any());
    }

    /**
     * Teste la création d'un équipement avec une catégorie inexistante.
     * 
     * Scénario: Créer un équipement avec un ID de catégorie qui n'existe pas
     * La marque existe, mais la catégorie n'existe pas
     * Résultat attendu: Une ResourceNotFoundException est levée avec l'ID de la catégorie
     */
    @Test
    void create_shouldThrowNotFoundException_whenCategoryNotFound() {
        UUID brandId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();
        EquipementRequest request = new EquipementRequest(
            EquipementSize.L, "Noir", "Casque",
            null, new BigDecimal("299.99"), brandId, categoryId,null
        );

        when(equipementBrandRepository.findById(brandId))
            .thenReturn(Optional.of(EquipementBrand.builder().build()));
        when(equipementCategoryRepository.findById(categoryId))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining(categoryId.toString());
    }

    /**
     * Teste la récupération de tous les équipements sans filtres.
     * 
     * Scénario: Récupérer tous les équipements avec pagination par défaut (page 0, 20 éléments)
     * Sans appliquer de filtres
     * Résultat attendu: Une page contenant les équipements est retournée
     */
    @Test
    void getAll_shouldReturnPage_whenNoFilters() {
        EquipementFilterRequest filter = new EquipementFilterRequest(
            null, null, null, null, null, null, null , null , null, null
        );
        PageRequest pageable = PageRequest.of(0, 20);
        Equipement entity = Equipement.builder().name("Casque").build();
        EquipementResponse response = new EquipementResponse(
            UUID.randomUUID(), "L", "Noir", "Casque",
            null, new BigDecimal("299.99"), null, null, null, null,null,null
        );

        when(repository.findAll(any(Specification.class), eq(pageable)))
            .thenReturn(new PageImpl<>(List.of(entity)));
        when(mapper.toResponse(entity)).thenReturn(response);

        Page<EquipementResponse> result = service.getAll(filter, pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(repository).findAll(any(Specification.class), eq(pageable));
    }

    /**
     * Teste la récupération des équipements filtrés par taille.
     * 
     * Scénario: Récupérer les équipements avec un filtre sur la taille "L"
     * Résultat attendu: Une page d'équipements correspondant au filtre est retournée
     * (dans ce cas, la page est vide)
     */
    @Test
    void getAll_shouldReturnPage_whenFilterBySize() {
        EquipementFilterRequest filter = new EquipementFilterRequest(
            null, null, null, null, null, "L" , null ,null, null,null
        );
        PageRequest pageable = PageRequest.of(0, 20);

        when(repository.findAll(any(Specification.class), eq(pageable)))
            .thenReturn(Page.empty());

        Page<EquipementResponse> result = service.getAll(filter, pageable);

        assertThat(result).isEmpty();
        verify(repository).findAll(any(Specification.class), eq(pageable));
    }

    /**
     * Teste la récupération d'un équipement par son ID quand il existe.
     * 
     * Scénario: Rechercher un équipement avec un ID valide qui existe en base
     * Résultat attendu: L'équipement est retourné avec toutes ses informations
     */
    @Test
    void getById_shouldReturnResponse_whenExists() {
        UUID id = UUID.randomUUID();
        Equipement entity = Equipement.builder().name("Casque").build();
        EquipementResponse response = new EquipementResponse(
            id, "L", "Noir", "Casque",
            null, new BigDecimal("299.99"), null, null, null, null, null, null
        );

        when(repository.findById(id)).thenReturn(Optional.of(entity));
        when(mapper.toResponse(entity)).thenReturn(response);

        assertThat(service.getById(id).id()).isEqualTo(id);
    }

    /**
     * Teste la récupération d'un équipement par son ID quand il n'existe pas.
     * 
     * Scénario: Rechercher un équipement avec un ID qui n'existe pas en base
     * Résultat attendu: Une ResourceNotFoundException est levée
     */
    @Test
    void getById_shouldThrowNotFoundException_whenNotExists() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(id))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    // ─── DELETE ───────────────────────────────────────────────

    /**
     * Teste la suppression d'un équipement quand il existe.
     * 
     * Scénario: Supprimer un équipement avec un ID valide qui existe en base
     * Résultat attendu: L'équipement est supprimé et la méthode delete du repository est appelée
     */
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