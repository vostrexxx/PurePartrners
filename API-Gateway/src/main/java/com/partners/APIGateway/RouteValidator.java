package com.partners.APIGateway;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.function.Predicate;

@Service
public class RouteValidator {
    public static final List<String> openEndpoints = List.of(
            "auth/register",
            "auth/login"
    );

    public Predicate<ServerHttpRequest> isSecured = serverHttpRequest -> openEndpoints.stream()
            .noneMatch(uri -> serverHttpRequest.getURI().getPath().contains(uri));

    @Bean
    @LoadBalanced
    public WebClient.Builder loadBalancedWebClientBuilder() {
        return WebClient.builder();
    }
}
