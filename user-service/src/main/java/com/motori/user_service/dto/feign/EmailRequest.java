package com.motori.user_service.dto.feign;

public record EmailRequest(
        String to,
        String subject,
        String body
) {}
