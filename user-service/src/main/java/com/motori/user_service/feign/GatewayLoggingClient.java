package com.motori.user_service.feign;

import com.motori.user_service.dto.feign.LogRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "gateway", url = "${gateway.service.url:http://localhost:8080}")
public interface GatewayLoggingClient {

    @PostMapping("/api/gateway/logs/save")
    void saveLog(@RequestBody LogRequest logRequest);
}
