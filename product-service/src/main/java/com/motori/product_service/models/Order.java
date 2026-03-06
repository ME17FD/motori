package com.motori.product_service.models;

import java.math.BigDecimal;

import java.util.List;
import java.util.UUID;



import com.motori.product_service.enums.OrderStatus;

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
@Table(name = "orders",
    indexes = {
        @Index(name = "idx_orders_deleted_at", columnList = "deleted_at"),
        @Index(name = "idx_orders_user_id", columnList = "user_id"),
        @Index(name = "idx_orders_status", columnList = "status")
    })                  
public class Order extends BaseEntity{
   

    @Column(name = "user_id", nullable = false)
    private UUID userId;       
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_items")
    private List<OrderItem> items;

    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;       

    @Column(name = "completed", nullable = false)
    @Builder.Default
    private boolean completed = false;   

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING; 

    
}
