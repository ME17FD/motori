package com.motori.product_service.models;



import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "equipement_brand", indexes = {
        @Index(name = "idx_equipement_brand_deleted_at", columnList = "deleted_at"),
        @Index(name = "idx_equipement_brand_name", columnList = "name")
    })

public class EquipementBrand extends BaseEntity{
    
    @Column(name = "name")
    private String name;
    
}
