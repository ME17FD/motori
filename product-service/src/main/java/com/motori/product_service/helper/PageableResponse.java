package com.motori.product_service.helper;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;

/**
 * Spring Data pagination wrapper for JSON serialization compatibility.
 * 
 * <p>Extends {@link PageImpl} to provide a serializable response wrapper for paginated
 * REST API endpoints. Handles bidirectional JSON conversion with property-based mapping
 * to ensure client library compatibility across different programming languages.
 * 
 * <p><b>Purpose:</b> Spring Data's default Page serialization includes additional metadata
 * that may not be compatible with all client libraries. This custom response class ensures
 * consistent pagination metadata in JSON responses.
 * 
 * <p><b>JSON Structure:</b> When serialized, this class produces:
 * <pre>
 * {
 *   "content": [ {...}, {...} ],  // List of T (actual page items)
 *   "number": 0,                   // Zero-based page index
 *   "size": 20,                    // Items per page
 *   "totalElements": 150           // Total items across all pages
 *   // totalPages calculated as: ceil(totalElements / size)
 * }
 * </pre>
 * 
 * <p><b>Pagination Metadata:</b>
 * <ul>
 *   <li><b>content:</b> List of result items of type T (e.g., ProductResponse objects)</li>
 *   <li><b>number:</b> Zero-based page index (page 0 = first page)</li>
 *   <li><b>size:</b> Number of items per page (typically 20 from @PageableDefault)</li>
 *   <li><b>totalElements:</b> Total count of all matching items across all pages</li>
 *   <li><b>totalPages:</b> Calculated automatically as ceil(totalElements / size)</li>
 * </ul>
 * 
 * <p><b>Usage in Controllers:</b>
 * <pre>
 * @GetMapping
 * public PageableResponse&lt;ProductResponse&gt; getProducts(
 *         @ParameterObject @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
 *     Page&lt;Product&gt; page = productRepository.findAll(pageable);
 *     return new PageableResponse&lt;&gt;(
 *         page.getContent(),
 *         page.getNumber(),
 *         page.getSize(),
 *         page.getTotalElements()
 *     );
 * }
 * </pre>
 * 
 * <p><b>Deserialization:</b> The {@link JsonCreator} annotation ensures JSON payload
 * with property names (content, number, size, totalElements) can be deserialized when
 * needed, allowing this type to be used for request/response contracts.
 * 
 * <p><b>Client-Side Integration:</b> Multi-language clients can easily parse pagination
 * metadata using standard JSON deserialization without additional Spring Data dependencies:
 * <ul>
 *   <li><b>JavaScript:</b> response.content (array), response.number (page), response.totalPages</li>
 *   <li><b>Python:</b> response['content'], response['number'], response['totalPages']</li>
 *   <li><b>Java:</b> pageableResponse.getContent(), pageableResponse.getNumber()</li>
 * </ul>
 * 
 * @param <T> Type of content items in the page
 * @author Motori Team
 * @since 1.0
 * @see org.springframework.data.domain.Page
 * @see org.springframework.data.domain.Pageable
 * @see org.springframework.data.web.PageableDefault
 */
public class PageableResponse<T> extends PageImpl<T> {

    /**
     * Constructs a pageable response from pagination metadata and content.
     * 
     * <p>This constructor is invoked by Spring's Jackson deserializer when converting
     * JSON payload to PageableResponse objects. The {@link JsonCreator} annotation
     * with PROPERTIES mode ensures field names in JSON match constructor parameter names.
     * 
     * <p><b>Parameter Mapping:</b> JSON fields map to constructor parameters:
     * <ul>
     *   <li>"content" → content: List of T (page items)</li>
     *   <li>"number" → page: Zero-based page index</li>
     *   <li>"size" → size: Items per page</li>
     *   <li>"totalElements" → totalElements: Total count across all pages</li>
     * </ul>
     * 
     * <p><b>Initialization:</b> Creates a PageRequest with the provided page number and size,
     * then passes it to the parent {@link PageImpl} constructor along with content and totalElements.
     * This allows totalPages to be calculated automatically via PageImpl's getter.
     * 
     * @param content List of result items of generic type T (must not be null, use empty list if no items)
     * @param page Zero-based page index (0 = first page, matching SQL OFFSET = page * size)
     * @param size Number of items per page (should match original Pageable.size() for consistency)
     * @param totalElements Total count of items matching the query across all pages
     * @throws IllegalArgumentException if page is negative or size is less than 1
     * 
     * @see JsonCreator
     * @see JsonProperty
     * @see PageRequest
     * @see PageImpl
     */
    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public PageableResponse(
            @JsonProperty("content") List<T> content,
            @JsonProperty("number") int page,
            @JsonProperty("size") int size,
            @JsonProperty("totalElements") long totalElements) {
        super(content, PageRequest.of(page, size), totalElements);
    }
}