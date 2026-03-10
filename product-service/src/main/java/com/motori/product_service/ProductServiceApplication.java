package com.motori.product_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

/**
 * Main entry point for the Product Service microservice.
 * 
 * This is a Spring Boot application that provides product management functionality
 * including equipment, parts, vehicles, and compatibility management.
 * 
 * Configuration:
 * - Enables Spring Boot auto-configuration for all dependencies
 * - Configures Spring Data Web support for pagination and filtering via DTOs
 * - Integrates with databases, Redis, and file storage (Minio)
 */
@SpringBootApplication
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class ProductServiceApplication {

	/**
	 * Starts the Spring Boot application.
	 * 
	 * @param args Command line arguments passed to the application
	 */
	public static void main(String[] args) {
		SpringApplication.run(ProductServiceApplication.class, args);
	}

}
