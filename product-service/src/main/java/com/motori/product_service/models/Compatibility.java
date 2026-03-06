package com.motori.product_service.models;




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
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter @Setter
@Table(name = "compatibility",
    indexes = {
        @Index(name = "idx_compatibility_deleted_at", columnList = "deleted_at"),
        @Index(name = "idx_compatibility_part_id", columnList = "part_id"),
        @Index(name = "idx_compatibility_vehicule_id", columnList = "vehicule_id"),
        @Index(name = "idx_compatibility_part_vehicle", columnList = "part_id, vehicule_id")
    })
public class Compatibility extends BaseEntity{
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id")
    private Parts part;           

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_id")
    private Vehicule vehicule;    

}