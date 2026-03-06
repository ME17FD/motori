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
@Table(name = "part_brand", indexes = {
        @Index(name = "idx_part_brand_deleted_at", columnList = "deleted_at"),
        @Index(name = "idx_part_brand_name", columnList = "name")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartBrand extends BaseEntity{

    @Column(name = "name")
    private String name;
    
}
