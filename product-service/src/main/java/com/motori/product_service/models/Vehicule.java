package com.motori.product_service.models;



import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "vehicule",
    indexes = {
        @Index(name = "idx_vehicule_deleted_at", columnList = "deleted_at"),
        @Index(name = "idx_vehicule_brand_id", columnList = "vehicule_brand_id")
    })
public class Vehicule extends BaseEntity{
    
    @Column(name = "name")
    private String name;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_brand_id")
    private VehiculeBrand vehiculeBrandId;

    @Column(name = "model")
    private String model;

}
