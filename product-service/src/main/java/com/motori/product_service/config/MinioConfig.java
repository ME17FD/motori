package com.motori.product_service.config;

import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for MinIO S3-compatible object storage client.
 * 
 * MinIO is used as the file storage backend for uploading and managing product images.
 * This configuration creates and configures a MinioClient bean that connects to a MinIO server
 * using credentials and endpoints specified in application properties.
 * 
 * Properties required:
 * - minio.url: The MinIO server URL (e.g., http://localhost:9000)
 * - minio.access-key: Access key for authentication
 * - minio.secret-key: Secret key for authentication
 */
@Configuration
public class MinioConfig {

    /** MinIO server URL from application properties */
    @Value("${minio.url}")
    private String url;

    /** MinIO access key from application properties */
    @Value("${minio.access-key}")
    private String accessKey;

    /** MinIO secret key from application properties */
    @Value("${minio.secret-key}")
    private String secretKey;

    /**
     * Creates and configures the MinIO client bean.
     * 
     * The client is configured with the server endpoint and credentials
     * needed to authenticate requests to the MinIO server.
     * 
     * @return configured MinioClient instance
     */
    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
            .endpoint(url)
            .credentials(accessKey, secretKey)
            .build();
    }
}