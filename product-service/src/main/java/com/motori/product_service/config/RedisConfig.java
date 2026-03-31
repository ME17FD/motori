package com.motori.product_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import lombok.extern.slf4j.Slf4j;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

/**
 * Configuration for Redis caching infrastructure.
 * 
 * This configuration enables Spring's caching abstraction using Redis and configures:
 * - Cache manager for managing cache operations
 * - Jackson serialization for safe JSON storage of objects in Redis
 * - Time-To-Live (TTL) of 10 minutes for all cached entries
 * - Support for Java 8+ LocalDateTime types
 * 
 * This enables the use of @Cacheable, @CacheEvict, and other caching annotations
 * throughout the application to improve performance.
 */
@Slf4j
@Configuration
@EnableCaching
public class RedisConfig {

    /**
     * Creates and configures the Redis cache manager.
     * 
     * The cache manager is configured with:
     * - Jackson2 JSON serialization for reliable object storage
     * - 10-minute TTL for all cache entries
     * - String serialization for cache keys
     * - Java 8 date/time support
     * - Null values are not cached
     * 
     * @param factory the Redis connection factory
     * @return configured RedisCacheManager
     */
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        log.info(">>> RedisConfig chargé");
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        Jackson2JsonRedisSerializer<Object> serializer =
            new Jackson2JsonRedisSerializer<>(mapper, Object.class);

        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair
                    .fromSerializer(new StringRedisSerializer())
            )
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair
                    .fromSerializer(serializer)
            )
            .disableCachingNullValues();

        return RedisCacheManager.builder(factory)
            .cacheDefaults(config)
            .build();
    }
}