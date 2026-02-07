package com.observability.api.controller;

import com.observability.api.model.Order;
import com.observability.api.service.MetricsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final List<Order> orders = new ArrayList<>();
    private final AtomicLong counter = new AtomicLong();

    @Autowired
    private MetricsService metricsService;

    @GetMapping
    public List<Order> getAllOrders() {
        return orders;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orders.stream()
                .filter(o -> o.getId().equals(id))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        order.setId(counter.incrementAndGet());
        orders.add(order);

        // Incrementar métrica customizada
        metricsService.incrementOrdersCreated();
        metricsService.updateActiveOrders(orders.size());

        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        return orders.stream()
                .filter(o -> o.getId().equals(id))
                .findFirst()
                .map(order -> {
                    order.setStatus(status);
                    if ("COMPLETED".equals(status) || "CANCELLED".equals(status)) {
                        metricsService.incrementOrdersCompleted();
                    }
                    return ResponseEntity.ok(order);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
