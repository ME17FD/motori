package com.motori.product_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Configuration class for JPA entity auditing.
 * 
 * Enables automatic auditing of JPA entities, allowing creation and modification
 * timestamps to be automatically populated by the Spring Data framework.
 * 
 * This configuration enables the AuditingEntityListener for all entities that
 * extend BaseEntity, automatically managing createdAt and updatedAt fields.
 */
@Configuration
@EnableJpaAuditing
public class AuditingConfig {
  
}
