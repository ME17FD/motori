package com.motori.user_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailTemplateService {

    @Value("${email.superadmin.address}")
    private String superAdminEmail;
    @Value("${email.frontend.base-url}")
    private String frontendBaseUrl;
    @Value("${email.verification.subject}")
    private String verificationSubject;
    @Value("${email.verification.body}")
    private String verificationBody;
    @Value("${email.approval.subject}")
    private String approvalSubject;
    @Value("${email.approval.body}")
    private String approvalBody;
    @Value("${email.superadmin-notification.subject}")
    private String superAdminNotificationSubject;
    @Value("${email.superadmin-notification.body}")
    private String superAdminNotificationBody;

    public String getSuperAdminEmail() { return superAdminEmail; }
    public String getFrontendBaseUrl() { return frontendBaseUrl; }
    public String getVerificationSubject() { return verificationSubject; }
    public String getVerificationBody(String firstname, String verificationLink) {
        return verificationBody.replace("{firstname}", firstname).replace("{verificationLink}", verificationLink);
    }
    public String getApprovalSubject() { return approvalSubject; }
    public String getApprovalBody(String firstname, String email) {
        return approvalBody.replace("{firstname}", firstname).replace("{email}", email);
    }
    public String getSuperAdminNotificationSubject() { return superAdminNotificationSubject; }
    public String getSuperAdminNotificationBody(String firstname, String lastname, String email, String role, Long userId) {
        return superAdminNotificationBody
                .replace("{firstname}", firstname).replace("{lastname}", lastname)
                .replace("{email}", email).replace("{role}", role).replace("{userId}", String.valueOf(userId));
    }
}
