package com.partners.APIGateway.filters;

import com.partners.APIGateway.dto.AuthServiceResponse;
import com.partners.APIGateway.config.RouteValidator;
import jakarta.ws.rs.BadRequestException;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.cloud.gateway.support.ServerWebExchangeUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.LinkedHashMap;

@Component
public class DisableCorsFilter extends AbstractGatewayFilterFactory<DisableCorsFilter.Config> {

    public DisableCorsFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(DisableCorsFilter.Config config) {
        return ((exchange, chain) -> {
            exchange.getResponse().getHeaders().remove(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN);
            exchange.getResponse().getHeaders().remove(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS);
            exchange.getResponse().getHeaders().remove(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS);
            exchange.getResponse().getHeaders().remove(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS);
            // Продолжаем выполнение цепочки фильтров
            return chain.filter(exchange);
        });
    }

    public static class Config{
    }
}
