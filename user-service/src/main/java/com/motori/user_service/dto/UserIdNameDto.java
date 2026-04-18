package com.motori.user_service.dto;

public record UserIdNameDto(
    Long id,
    String firstname,
    String lastname,
    String role
) {}
