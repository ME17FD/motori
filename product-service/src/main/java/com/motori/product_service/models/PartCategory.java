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
@Table(name = "part_category",
    indexes = {
        @Index(name = "idx_part_category_deleted_at", columnList = "deleted_at"),
        @Index(name = "idx_part_category_name", columnList = "name"),
        @Index(name = "idx_part_category_parent_id", columnList = "parent_category_id")
    })
public class PartCategory extends BaseEntity{
    
    @Column(name = "name")
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_category_id")
    private PartCategory parent;

}
