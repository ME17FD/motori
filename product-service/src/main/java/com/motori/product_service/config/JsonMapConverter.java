package com.motori.product_service.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.Map;

/**
 * JPA converter for JSON serialization/deserialization to/from database columns.
 * 
 * This converter enables storing complex Java Map objects as JSON strings in the database
 * and automatically deserializes them back to Map objects when reading from the database.
 * 
 * Used to store flexible, schema-less properties for entities like Equipment and Parts.
 * The conversion uses Jackson ObjectMapper for reliable JSON handling.
 */
@Converter
public class JsonMapConverter implements AttributeConverter<Map<String, Object>, String> {

    private static final ObjectMapper mapper = new ObjectMapper();

    /**
     * Converts a Map object to a JSON string for database storage.
     * 
     * @param attribute the Map to convert to JSON
     * @return JSON string representation, or null if attribute is null
     * @throws IllegalArgumentException if JSON serialization fails
     */
    @Override
    public String convertToDatabaseColumn(Map<String, Object> attribute) {
        if (attribute == null) return null;
        try {
            return mapper.writeValueAsString(attribute);
        } catch (Exception e) {
            throw new IllegalArgumentException("Erreur sérialisation JSON", e);
        }
    }

    /**
     * Converts a JSON string from the database back to a Map object.
     * 
     * @param dbData the JSON string from database
     * @return Map representation of the JSON, or null if dbData is null
     * @throws IllegalArgumentException if JSON deserialization fails
     */
    @Override
    public Map<String, Object> convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        try {
            return mapper.readValue(dbData, new TypeReference<>() {});
        } catch (Exception e) {
            throw new IllegalArgumentException("Erreur désérialisation JSON", e);
        }
    }
}