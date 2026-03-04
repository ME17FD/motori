package com.motori.product_service.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
@Table(name = "parts")
public class Parts {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "ref", unique = true, nullable = false)
    private String ref;

    @ManyToOne(fetch = FetchType.LAZY)   
    @JoinColumn(name = "part_category_id")
    private PartCategory partCategory;   

    @ManyToOne(fetch = FetchType.LAZY)   
    @JoinColumn(name = "part_brand_id")
    private PartBrand partBrand;         

    @Column(name = "price", nullable = false)
    private BigDecimal price;            

    @Column(name = "created_at")
    private LocalDateTime createdAt;     

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}