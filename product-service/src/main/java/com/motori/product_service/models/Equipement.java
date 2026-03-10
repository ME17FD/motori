package com.motori.product_service.models;

import java.math.BigDecimal;
import java.util.Map;

import com.motori.product_service.config.CustomFunctionContributor;
import com.motori.product_service.config.JsonMapConverter;
import com.motori.product_service.enums.EquipementSize;
import com.motori.product_service.specification.JsonbSpecification;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "equipement",
    indexes = {
        @Index(name = "idx_equipement_deleted_at", columnList = "deleted_at"),
        @Index(name = "idx_equipement_brand_id", columnList = "equipement_brand_id"),
        @Index(name = "idx_equipement_category_id", columnList = "equipement_category_id")
    })

public class Equipement extends BaseEntity{


    @Column(name="size")
    @Enumerated(EnumType.STRING)
    private EquipementSize size;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "color")
    private String color;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name ="equipement_category_id")
    private EquipementCategory equipementCategoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipement_brand_id")
    private EquipementBrand equipementBrandId;
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "description")
    private String description;

    @Convert(converter = JsonMapConverter.class)
    @Column(columnDefinition = "jsonb DEFAULT NULL::jsonb")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    private Map<String, Object> properties;
    
/**
 * Pre-computed full-text search vector generated automatically by PostgreSQL
 * from the {@code properties} JSONB column via {@code GENERATED ALWAYS AS}.
 *
 * <p>This column is never written by Spring — PostgreSQL maintains it on every
 * INSERT/UPDATE. The GIN index on this column enables O(log n) full-text
 * search even on tables with millions of rows.
 *
 * <p>Used by {@link JsonbSpecification#hasPropertySearch} via the
 * {@code tsmatch} function registered in {@link CustomFunctionContributor}.
 */
    @Column(name = "search_vector", columnDefinition = "tsvector", insertable = false, updatable = false)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.OTHER)
    private String searchVector;

    @Column(name = "price")
    private BigDecimal price;

}
