package com.partners.APIGateway;

import jakarta.ws.rs.BadRequestException;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.cloud.gateway.support.ServerWebExchangeUtils;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.LinkedHashMap;

@Component
public class ResetCredentialsFilter extends AbstractGatewayFilterFactory<ResetCredentialsFilter.Config> {

    private final RouteValidator routeValidator;
    private final WebClient.Builder webClient;


    public ResetCredentialsFilter(RouteValidator routeValidator, WebClient.Builder webClient) {
        super(Config.class);
        this.routeValidator = routeValidator;
        this.webClient = webClient;
    }

    @Override
    public GatewayFilter apply(ResetCredentialsFilter.Config config) {
        return ((exchange, chain) -> {
            LinkedHashMap<String, Object> body = exchange.getAttribute(ServerWebExchangeUtils.CACHED_REQUEST_BODY_ATTR);
            String phoneNumber;
            if (body != null)
                phoneNumber = (String) body.get("phoneNumber");
            else
                throw new BadRequestException("No phoneNumber provided");
            Mono<AuthServiceResponse> responseMono = webClient.build()
                    .get()
                    .uri("http://auth-service/auth/{phoneNumber}", phoneNumber)
                    .retrieve()
                    .bodyToMono(AuthServiceResponse.class);
            return responseMono.flatMap(response -> {
                if (!response.getHttpStatus().equals("OK"))
                    throw new BadRequestException("Error in validating phoneNumber");
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
