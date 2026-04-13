package com.motori.product_service.config;

import com.motori.product_service.enums.EquipementSize;
import com.motori.product_service.models.Equipement;
import com.motori.product_service.models.EquipementBrand;
import com.motori.product_service.models.EquipementCategory;
import com.motori.product_service.models.Inventory;
import com.motori.product_service.models.PartBrand;
import com.motori.product_service.models.PartCategory;
import com.motori.product_service.models.Parts;
import com.motori.product_service.repository.EquipementBrandRepository;
import com.motori.product_service.repository.EquipementCategoryRepository;
import com.motori.product_service.repository.EquipementRepository;
import com.motori.product_service.repository.InventoryRepository;
import com.motori.product_service.repository.PartBrandRepository;
import com.motori.product_service.repository.PartCategoryRepository;
import com.motori.product_service.repository.PartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Inserts a small catalog sample when the parts table is empty (same idea as
 * {@code AdminInitializer} in user-service: idempotent, runs once per empty DB).
 */
@Component
@RequiredArgsConstructor
public class ProductCatalogTestDataInitializer implements CommandLineRunner {

    private final PartRepository partRepository;
    private final PartBrandRepository partBrandRepository;
    private final PartCategoryRepository partCategoryRepository;
    private final EquipementRepository equipementRepository;
    private final EquipementBrandRepository equipementBrandRepository;
    private final EquipementCategoryRepository equipementCategoryRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    public void run(String... args) {
        if (partRepository.count() > 0) {
            return;
        }
        PartCategory root = partCategoryRepository.save(
                PartCategory.builder().name("Pièces moteur").parent(null).build());
        PartCategory filters = partCategoryRepository.save(
                PartCategory.builder().name("Filtres").parent(root).build());

        PartBrand brand = partBrandRepository.save(PartBrand.builder().name("Motori Parts").build());

        Parts oilFilter = partRepository.save(Parts.builder()
                .name("Filtre à huile standard")
                .ref("MOT-FH-001")
                .description("Filtre à huile compatible multimarque")
                .price(new BigDecimal("24.90"))
                .partBrand(brand)
                .partCategory(filters)
                .properties(Map.of("type", "huile", "thread", "M20"))
                .build());

        Parts airFilter = partRepository.save(Parts.builder()
                .name("Filtre à air sport")
                .ref("MOT-FA-002")
                .description("Flux d'air optimisé")
                .price(new BigDecimal("45.00"))
                .partBrand(brand)
                .partCategory(filters)
                .properties(Map.of("type", "air"))
                .build());

        EquipementCategory helmRoot = equipementCategoryRepository.save(
                EquipementCategory.builder().name("Équipement pilote").parent(null).build());
        EquipementCategory helmets = equipementCategoryRepository.save(
                EquipementCategory.builder().name("Casques").parent(helmRoot).build());

        EquipementBrand helmBrand = equipementBrandRepository.save(
                EquipementBrand.builder().name("Motori Gear").build());

        Equipement helmet = equipementRepository.save(Equipement.builder()
                .name("Casque intégral test")
                .description("Taille M, homologué ECE")
                .size(EquipementSize.M)
                .color("Noir mat")
                .price(new BigDecimal("189.00"))
                .equipementBrandId(helmBrand)
                .equipementCategoryId(helmets)
                .properties(Map.of("norm", "ECE 22.06"))
                .build());

        inventoryRepository.save(Inventory.builder().part(oilFilter).equipement(null).build());
        inventoryRepository.save(Inventory.builder().part(airFilter).equipement(null).build());
        inventoryRepository.save(Inventory.builder().part(null).equipement(helmet).build());
    }
}
