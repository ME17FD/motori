package com.motori.user_service.repository;

import com.motori.user_service.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByKeycloakId(String keycloakId);

    boolean existsByEmail(String email);

    Optional<User> findByEmailAndApprovedTrue(String email);

    long countByRole(User.Role role);

    List<User> findByRoleAndManager(User.Role role, User manager);

    long countByRoleIn(List<User.Role> roles);

    long countByRoleInAndApprovedTrue(List<User.Role> roles);

    long countByRoleInAndApprovedFalse(List<User.Role> roles);

    long countByRoleAndApprovedTrue(User.Role role);

    long countByRoleAndApprovedFalse(User.Role role);
}
