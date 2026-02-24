package com.motori.user_service.service;

import com.motori.user_service.models.User;
import com.motori.user_service.models.VerificationToken;
import com.motori.user_service.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationTokenService {

    private final VerificationTokenRepository verificationTokenRepository;

    @Transactional
    public String generateVerificationToken(User user) {
        verificationTokenRepository.findByUserId(user.getId()).ifPresent(verificationTokenRepository::delete);
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken(token, user);
        verificationTokenRepository.save(verificationToken);
        return token;
    }

    public Optional<VerificationToken> getTokenByToken(String token) {
        return verificationTokenRepository.findByToken(token);
    }

    @Transactional
    public void markTokenAsUsed(String token) {
        verificationTokenRepository.markTokenAsUsed(token);
    }
}
