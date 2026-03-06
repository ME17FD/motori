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
