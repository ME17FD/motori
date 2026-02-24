package com.motori.user_service.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateUserFileRequest(
    @NotNull(message = "File ID is required")
    String fileId
) {}
