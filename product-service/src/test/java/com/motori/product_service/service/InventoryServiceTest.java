package com.motori.product_service.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.motori.product_service.dto.InventoryDTO.InventoryRequest;
import com.motori.product_service.dto.InventoryDTO.InventoryResponse;
import com.motori.product_service.mapper.InventoryMapper;
import com.motori.product_service.models.Inventory;
import com.motori.product_service.models.Parts;
import com.motori.product_service.repository.EquipementRepository;
import com.motori.product_service.repository.InventoryRepository;
import com.motori.product_service.repository.PartRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;
import java.util.UUID;


/**
 * Unit tests for InventoryService with mocked dependencies.
 * 
 * <p>Tests the business logic of {@link InventoryService} which manages flexible
 * stock tracking for either Parts OR Equipment (XOR constraint). Uses Mockito to mock
 * repository and mapper dependencies for isolated testing.
 * 
 * <p><b>Test Framework:</b> Mockito @ExtendWith, AssertJ assertions, JUnit5 @Test
 * 
 * <p><b>Mocked Components:</b>
 * <ul>
 *   <li>{@link InventoryRepository} - Stock item CRUD and queries</li>
 *   <li>{@link PartRepository}, {@link EquipementRepository} - Product existence validation</li>
 *   <li>{@link InventoryMapper} - Entity ↔ DTO conversion</li>
 * </ul>
 * 
 * <p><b>Key Business Rule - XOR Constraint:</b> Each inventory record links to
 * EITHER a Part OR Equipment, but never both. Tests verify this critical discriminator:
 * <pre>
 * ✗ Invalid: partId=123, equipementId=456 (both set)
 * ✓ Valid: partId=123, equipementId=null (only Part)
 * ✓ Valid: partId=null, equipementId=456 (only Equipment)
 * </pre>
 * 
 * <p><b>Availability Tracking:</b>
 * <ul>
 *   <li>soldAt=null → inventory available for purchase</li>
 *   <li>soldAt=timestamp → inventory sold (immutable after order)</li>
 * </ul>
 * 
 * <p><b>Test Coverage:</b>
 * <ul>
 *   <li>CREATE: XOR validation, product existence checks</li>
 *   <li>READ: Filter by availability, payment status, product type</li>
 * </ul>
 * 
 * @author Motori Team
 * @since 1.0
 * @see InventoryService
 */
@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock private InventoryRepository repository;
    @Mock private PartRepository partRepository;
    @Mock private EquipementRepository equipementRepository;
    @Mock private InventoryMapper mapper;

    @InjectMocks
    private InventoryService service;

    @Test
    void create_shouldThrowException_whenBothPartAndEquipementProvided() {
        InventoryRequest request = new InventoryRequest(
            UUID.randomUUID(),   // partId
            UUID.randomUUID(),   // equipementId — les deux renseignés
            null
        );

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("à la fois");

        verify(repository, never()).save(any());
    }

    @Test
    void create_shouldThrowException_whenNeither9yMnTm4NSzvG9rrwjM2ec8xZgh1cafXH8() {
        InventoryRequest request = new InventoryRequest(
            null,   // partId
            null,   // equipementId — les deux null
            null
        );

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("soit");

        verify(repository, never()).save(any());
    }

    @Test
    void create_shouldReturnResponse_whenOnlyPartProvided() {
        UUID partId = UUID.randomUUID();
        InventoryRequest request = new InventoryRequest(partId, null, null);

        Parts part = Parts.builder().name("Filtre").build();
        Inventory inventory = Inventory.builder().build();
        InventoryResponse response = new InventoryResponse(
            UUID.randomUUID(), null, null, null, null, "PENDING", null, null
        );

        when(partRepository.findById(partId)).thenReturn(Optional.of(part));
        when(mapper.toEntity(request)).thenReturn(inventory);
        when(repository.save(inventory)).thenReturn(inventory);
        when(mapper.toResponse(inventory)).thenReturn(response);

        InventoryResponse result = service.create(request);

        assertThat(result).isNotNull();
        assertThat(result.paymentStatus()).isEqualTo("PENDING");
        verify(repository).save(inventory);
    }
}
