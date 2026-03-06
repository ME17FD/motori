package com.motori.product_service.models;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.SoftDelete;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

// BaseEntity.java
@MappedSuperclass
// ↑ dit à JPA que cette classe n'est pas une entité elle-même
// mais que ses champs sont hérités par les entités filles
@EntityListeners(AuditingEntityListener.class)
// ↑ active l'écoute des événements JPA pour remplir automatiquement
// createdAt et updatedAt
@Getter
@Setter
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @CreatedDate
    // ↑ rempli automatiquement au moment du premier save()
    @Column(name = "created_at", nullable = false, updatable = false)
    // updatable = false → cette valeur ne change jamais après la création
    private LocalDateTime createdAt;

    @LastModifiedDate
    // ↑ mis à jour automatiquement à chaque save()
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @SoftDelete
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
