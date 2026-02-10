package com.observability.api.filter;

import io.opentelemetry.api.trace.Span;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Filtro para adicionar informações de trace e HTTP ao MDC para logging estruturado
 */
@Component
@Order(1)
public class LoggingFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(LoggingFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        long startTime = System.currentTimeMillis();

        try {
            // Obter span atual do OpenTelemetry
            Span currentSpan = Span.current();
            String traceId = currentSpan.getSpanContext().getTraceId();
            String spanId = currentSpan.getSpanContext().getSpanId();

            // Adicionar ao MDC (será incluído nos logs JSON)
            MDC.put("trace_id", traceId);
            MDC.put("span_id", spanId);
            MDC.put("http_method", httpRequest.getMethod());
            MDC.put("http_path", httpRequest.getRequestURI());

            // Processar requisição
            chain.doFilter(request, response);

            // Calcular duração
            long duration = System.currentTimeMillis() - startTime;

            // Adicionar informações da resposta
            MDC.put("http_status_code", String.valueOf(httpResponse.getStatus()));
            MDC.put("http_duration_ms", String.valueOf(duration));

            // Log estruturado da requisição
            logger.info("{} {} - {} ({}ms)",
                    httpRequest.getMethod(),
                    httpRequest.getRequestURI(),
                    httpResponse.getStatus(),
                    duration);

        } finally {
            // Limpar MDC para evitar vazamento de memória
            MDC.clear();
        }
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        logger.info("LoggingFilter initialized");
    }

    @Override
    public void destroy() {
        logger.info("LoggingFilter destroyed");
    }
}
