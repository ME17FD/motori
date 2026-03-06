package com.motori.product_service.repository;

import java.util.Optional;
import java.util.UUID;


import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.motori.product_service.models.Parts;

public interface PartRepository extends JpaRepository<Parts, UUID>,
    JpaSpecificationExecutor<Parts> {
    @EntityGraph(attributePaths = {"partBrand", "partCategory", "partCategory.parent"})
    Page<Parts> findAll(Specification<Parts> spec, Pageable pageable);
    Optional<Parts> findByRef(String ref);
}
