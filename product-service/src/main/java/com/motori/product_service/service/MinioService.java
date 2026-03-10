package com.motori.product_service.service;

import io.minio.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * Service responsible for file storage operations with MinIO S3 compatibility.
 * <p>
 * Manages image uploads and deletions for equipment and parts using MinIO, an S3-compatible object storage.
 * Handles bucket creation, unique file naming with UUIDs, content type detection, and URL generation.
 * Integrates with Spring's MultipartFile for request processing.
 * </p>
 * <p>
 * File Organization:
 * - Files are organized by folder (e.g., 'parts', 'equipements')
 * - Each file is renamed with UUID to ensure uniqueness
 * - Original file extension is preserved
 * - Public URLs are generated for HTTP access
 * </p>
 * @author Motori Team
 * @since 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MinioService {

    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucket;

    @Value("${minio.url}")
    private String minioUrl;

    /**
     * Uploads an image file to MinIO S3 storage.
     * <p>
     * Creates the bucket if it doesn't exist, generates a unique filename with UUID, uploads the file with
     * proper content type, and returns the publicly accessible URL. File size and stream handling is delegated
     * to Spring's MultipartFile.
     * </p>
     * @param file the image file to upload (MultipartFile from HTTP request)
     * @param folder the subfolder path within the bucket (e.g., 'parts', 'equipements')
     * @return the public URL of the uploaded image (format: {minioUrl}/{bucket}/{folder}/{uuid}.{extension})
     * @throws RuntimeException if bucket creation or file upload to MinIO fails
     */
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

    /**
     * Deletes an image file from MinIO S3 storage.
     * <p>
     * Extracts the object key from the full public URL and removes it from the bucket.
     * Errors during deletion are logged but not rethrown to allow graceful failure.
     * </p>
     * @param imageUrl the public URL of the image to delete (obtained from uploadImage())
     */
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

    /**
     * Extracts the file extension from a filename, with .jpg as default.
     * <p>
     * Handles null filenames gracefully by returning .jpg as fallback.
     * </p>
     * @param filename the original filename from the uploaded file
     * @return the file extension including the dot (e.g., '.jpg', '.png')
     */
    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf("."));
    }
}