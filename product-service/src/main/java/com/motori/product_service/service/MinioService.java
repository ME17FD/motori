package com.motori.product_service.service;

import io.minio.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MinioService {

    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucket;

    @Value("${minio.internal-url:${minio.url}}")
    private String internalMinioUrl;  // Internal URL for MinIO client (http://motori-minio:9000)

    @Value("${minio.external-url:http://localhost:9000}")
    private String externalMinioUrl;  // External URL for browser access (http://localhost:9000)

    public String uploadImage(MultipartFile file, String folder) {
        try {
            log.info("Uploading image to MinIO - Bucket: {}, Folder: {}, File: {}", 
                bucket, folder, file.getOriginalFilename());

            // Check if bucket exists, create if not
            boolean bucketExists = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(bucket).build()
            );
            if (!bucketExists) {
                minioClient.makeBucket(
                    MakeBucketArgs.builder().bucket(bucket).build()
                );
                log.info("Bucket created: {}", bucket);
            }

            // Generate unique filename
            String extension = getExtension(file.getOriginalFilename());
            String objectName = folder + "/" + UUID.randomUUID() + extension;

            // Upload to MinIO using internal URL
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build()
            );

            // Return EXTERNAL URL for browser access (localhost, not motori-minio)
            String imageUrl = externalMinioUrl + "/" + bucket + "/" + objectName;
            log.info("Image uploaded successfully - Internal: {}/{} , External URL: {}", 
                internalMinioUrl, objectName, imageUrl);
            return imageUrl;

        } catch (Exception e) {
            log.error("Error uploading image to MinIO: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de l'upload de l'image: " + e.getMessage(), e);
        }
    }

    public void deleteImage(String imageUrl) {
        try {
            // Extract object name from URL (handle both internal and external URLs)
            String objectName;
            if (imageUrl.contains(internalMinioUrl)) {
                objectName = imageUrl.substring(imageUrl.indexOf(bucket) + bucket.length() + 1);
            } else {
                objectName = imageUrl.substring(imageUrl.indexOf(bucket) + bucket.length() + 1);
            }
            
            minioClient.removeObject(
                RemoveObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .build()
            );
            log.info("Image deleted successfully: {}", objectName);
        } catch (Exception e) {
            log.error("Error deleting image from MinIO: {}", e.getMessage(), e);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf("."));
    }
}