package com.partners.APIGateway.filters;

import com.partners.APIGateway.dto.AuthServiceResponse;
import com.partners.APIGateway.config.RouteValidator;
import com.partners.APIGateway.exception.TokenValidationException;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.cloud.gateway.filter.factory.rewrite.ModifyRequestBodyGatewayFilterFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final RouteValidator routeValidator;
    private final WebClient.Builder webClientBuilder;

    public AuthenticationFilter(RouteValidator routeValidator, WebClient.Builder webClientBuilder) {
        super(Config.class);
        this.routeValidator = routeValidator;
        this.webClientBuilder = webClientBuilder;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {
            ServerHttpRequest serverHttpRequest = exchange.getRequest();

            if (!routeValidator.isSecured.test(serverHttpRequest)){
                return chain.filter(exchange);
            }

            String token = serverHttpRequest.getQueryParams().getFirst("token");
            String authHeader;
            if (token != null && !token.isEmpty()){
                authHeader = "Bearer " + token;
                log.info("Extracted token: {}", token);
            } else {
                if (!serverHttpRequest.getHeaders().containsKey(HttpHeaders.AUTHORIZATION))
                    throw new RuntimeException("No authorization token");

                authHeader = serverHttpRequest.getHeaders().getValuesAsList(HttpHeaders.AUTHORIZATION).get(0);
            }
            log.info("Request Method: {}, URI: {}", exchange.getRequest().getMethod(), exchange.getRequest().getURI());
            //TODO
            //Exception handling
            //Make webClient as separate class
            Mono<AuthServiceResponse> authServiceResponse = webClientBuilder.build()
                    .get()
                    .uri("http://auth-service/auth/validateToken/{token}", authHeader)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, clientResponse -> {
                        log.error("4xx Error during token validation: {}", clientResponse.statusCode());
                        throw new TokenValidationException(HttpStatus.FORBIDDEN, "Authorization failed");
                    })
                    .bodyToMono(AuthServiceResponse.class);
            return authServiceResponse.flatMap(response -> {
                log.info("EXCHANGE: {}", exchange.getRequest().getURI());
                log.info("AUTH RESPONSE: {}", response);
                if (!response.getHttpStatus().equals("OK"))
                    throw new TokenValidationException(HttpStatus.FORBIDDEN, "Token validation failed");
                else {
                    Long userId = response.getUserId();
                    return chain.filter(exchange.mutate().request(
                            exchange.getRequest().mutate()
                                    .header("userId", userId.toString())
                                    .build())
                            .build());
                }
            });
        });
    }

    public static class Config{
    }
}
