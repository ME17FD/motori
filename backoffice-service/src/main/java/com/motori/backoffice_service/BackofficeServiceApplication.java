package com.motori.backoffice_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = "com.motori.order.model")
public class BackofficeServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackofficeServiceApplication.class, args);
	}

}
