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

    @Value("${minio.url}")
    private String minioUrl;

    public String uploadImage(MultipartFile file, String folder) {
        try {
            // Vérifie que le bucket existe, sinon le crée
            boolean bucketExists = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(bucket).build()
            );
            if (!bucketExists) {
                minioClient.makeBucket(
                    MakeBucketArgs.builder().bucket(bucket).build()
                );
                log.info("Bucket créé : {}", bucket);
            }

            // Génère un nom unique pour l'image
            String extension = getExtension(file.getOriginalFilename());
            String objectName = folder + "/" + UUID.randomUUID() + extension;
            // ↑ ex: parts/uuid.jpg ou equipements/uuid.png

            // Upload vers Minio
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build()
            );

            // Retourne l'URL publique de l'image
            String imageUrl = minioUrl + "/" + bucket + "/" + objectName;
            log.info("Image uploadée : {}", imageUrl);
            return imageUrl;

        } catch (Exception e) {
            log.error("Erreur lors de l'upload de l'image : {}", e.getMessage());
            throw new RuntimeException("Erreur lors de l'upload de l'image");
        }
    }

    public void deleteImage(String imageUrl) {
        try {
            // Extrait le nom de l'objet depuis l'URL
            String objectName = imageUrl.replace(
                minioUrl + "/" + bucket + "/", ""
            );
            minioClient.removeObject(
                RemoveObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .build()
            );
            log.info("Image supprimée : {}", objectName);
        } catch (Exception e) {
            log.error("Erreur lors de la suppression de l'image : {}", e.getMessage());
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf("."));
    }
}