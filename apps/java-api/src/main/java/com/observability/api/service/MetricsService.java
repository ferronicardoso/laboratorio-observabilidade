package com.observability.api.service;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicInteger;

@Service
public class MetricsService {

    private final Counter productsCreatedCounter;
    private final Counter productsDeletedCounter;
    private final Counter ordersCreatedCounter;
    private final Counter ordersCompletedCounter;
    private final AtomicInteger activeOrders;

    public MetricsService(MeterRegistry meterRegistry) {
        // Contadores
        this.productsCreatedCounter = Counter.builder("products_created_total")
                .description("Total de produtos criados")
                .register(meterRegistry);

        this.productsDeletedCounter = Counter.builder("products_deleted_total")
                .description("Total de produtos deletados")
                .register(meterRegistry);

        this.ordersCreatedCounter = Counter.builder("orders_created_total")
                .description("Total de pedidos criados")
                .register(meterRegistry);

        this.ordersCompletedCounter = Counter.builder("orders_completed_total")
                .description("Total de pedidos concluídos")
                .register(meterRegistry);

        // Gauge (medidor)
        this.activeOrders = new AtomicInteger(0);
        Gauge.builder("orders_active", activeOrders, AtomicInteger::get)
                .description("Número de pedidos ativos")
                .register(meterRegistry);
    }

    public void incrementProductsCreated() {
        productsCreatedCounter.increment();
    }

    public void incrementProductsDeleted() {
        productsDeletedCounter.increment();
    }

    public void incrementOrdersCreated() {
        ordersCreatedCounter.increment();
    }

    public void incrementOrdersCompleted() {
        ordersCompletedCounter.increment();
    }

    public void updateActiveOrders(int count) {
        activeOrders.set(count);
    }
}
