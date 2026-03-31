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

/**
 * Abstract base class for all JPA entities in the application.
 * 
 * This class provides common audit fields for all entities:
 * - id: Primary key generated as UUID
 * - createdAt: Automatically set when entity is first created
 * - updatedAt: Automatically updated whenever entity is modified
 * - deletedAt: Used for soft delete functionality (data is not physically deleted)
 * 
 * All domain models should extend this class to inherit these audit fields.
 * The class uses JPA's AuditingEntityListener to automatically manage audit timestamps.
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public abstract class BaseEntity {

    /**
     * Unique identifier for the entity.
     * Generated as a UUID by the database.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Timestamp when this entity was created.
     * Automatically set on first save() and is immutable thereafter.
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp when this entity was last modified.
     * Automatically updated on each save() call.
     */
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    /**
     * Timestamp when this entity was soft-deleted.
     * Null if entity is not deleted.
     * Used for logical deletion without removing data from database.
     */
    @SoftDelete
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
