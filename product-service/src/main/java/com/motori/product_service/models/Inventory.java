package com.motori.product_service.models;


import java.time.LocalDateTime;


import com.motori.product_service.enums.PayementStatus;

import jakarta.persistence.Column;
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
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter @Setter
@Table(name = "inventory",
    indexes = {
        @Index(name = "idx_inventory_deleted_at", columnList = "deleted_at"),
        @Index(name = "idx_inventory_part_id", columnList = "part_id"),
        @Index(name = "idx_inventory_equipement_id", columnList = "equipement_id")
    })
public class Inventory extends BaseEntity{
   

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = true)
    private Parts part;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipement_id", nullable = true)
    private Equipement equipement;

    @Column(name = "sold_at")
    private LocalDateTime soldAt;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    @Builder.Default
    private PayementStatus paymentStatus = PayementStatus.PENDING;

}
