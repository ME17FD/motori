package com.motori.product_service.models;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.motori.product_service.config.CustomFunctionContributor;
import com.motori.product_service.config.JsonMapConverter;
import com.motori.product_service.specification.JsonbSpecification;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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
@Table(name = "parts",
    indexes = {
        @Index(name = "idx_parts_deleted_at", columnList = "deleted_at"),
        @Index(name = "idx_parts_part_brand_id", columnList = "part_brand_id"),
        @Index(name = "idx_parts_part_category_id", columnList = "part_category_id")
    })
public class Parts extends BaseEntity{
    

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "image_url")
    private String imageUrl;

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

    @OneToMany(mappedBy = "part", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Compatibility> compatibilities = new ArrayList<>();

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
    
    @Column(name = "price", nullable = false)
    private BigDecimal price;            

}