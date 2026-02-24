package com.motori.user_service.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_user_email", columnList = "email"),
        @Index(name = "idx_user_role", columnList = "role"),
        @Index(name = "idx_user_manager", columnList = "manager_id"),
        @Index(name = "idx_user_created", columnList = "created_at"),
        @Index(name = "idx_user_last_login", columnList = "last_login_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "firstname", nullable = false)
    private String firstname;

    @NotBlank
    @Column(name = "lastname", nullable = false)
    private String lastname;

    @NotBlank
    @Email
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "adress")
    private String adress;

    @NotNull
    @Column(name = "approved", nullable = false)
    private Boolean approved;

    @Column(name = "activated", nullable = false, columnDefinition = "boolean default false")
    private Boolean activated;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    @OneToMany(mappedBy = "manager", cascade = CascadeType.ALL)
    private List<User> subordinates;

    @Column(name = "keycloak_id")
    private String keycloakId;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "profile_picture_id")
    private String profilePictureId;

    @Column(name = "id_front_picture_id")
    private String idFrontPictureId;

    @Column(name = "id_back_picture_id")
    private String idBackPictureId;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (activated == null) activated = false;
        if (approved == null) approved = true;
        if (status == null) status = Status.TRIAL;
    }

    public enum Role {
        SUPERADMIN, ADMIN, USER
    }

    public enum Status {
        PAID, UNPAID, TRIAL
    }
}
