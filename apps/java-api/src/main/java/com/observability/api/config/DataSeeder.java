package com.observability.api.config;

import com.observability.api.model.Product;
import com.observability.api.model.Order;
import com.observability.api.repository.ProductRepository;
import com.observability.api.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    CommandLineRunner initDatabase(ProductRepository productRepository, OrderRepository orderRepository) {
        return args -> {
            // Verificar se já existem dados
            if (productRepository.count() > 0) {
                logger.info("Database already seeded, skipping...");
                return;
            }

            logger.info("Seeding database with sample data...");

            // Criar produtos de teste
            productRepository.save(new Product(null, "Laptop Dell XPS 15", "Laptop de alta performance com tela 4K", 8999.99, 15));
            productRepository.save(new Product(null, "Mouse Logitech MX Master 3", "Mouse ergonômico sem fio", 549.90, 50));
            productRepository.save(new Product(null, "Teclado Mecânico Keychron K2", "Teclado mecânico 75% wireless", 799.00, 30));
            productRepository.save(new Product(null, "Monitor LG UltraWide 34\"", "Monitor ultrawide 21:9 IPS", 2499.99, 10));
            productRepository.save(new Product(null, "Webcam Logitech C920", "Webcam Full HD 1080p", 399.00, 25));
            productRepository.save(new Product(null, "Headset HyperX Cloud II", "Headset gamer com som surround 7.1", 599.90, 40));
            productRepository.save(new Product(null, "SSD Samsung 970 EVO 1TB", "SSD NVMe M.2 de alta velocidade", 899.00, 20));
            productRepository.save(new Product(null, "Cadeira Gamer DXRacer", "Cadeira ergonômica para longas sessões", 1999.00, 8));
            productRepository.save(new Product(null, "Hub USB-C 7 em 1", "Hub com HDMI, USB 3.0 e leitor SD", 199.90, 60));
            productRepository.save(new Product(null, "Mousepad Grande RGB", "Mousepad gaming 80x30cm com iluminação", 149.90, 100));

            // Criar alguns pedidos de teste (Order constructor: id, customerName, productIds, totalAmount)
            orderRepository.save(new Order(null, "João Silva", java.util.Arrays.asList(1L), 8999.99));
            orderRepository.save(new Order(null, "Maria Santos", java.util.Arrays.asList(4L), 2499.99));
            orderRepository.save(new Order(null, "Pedro Costa", java.util.Arrays.asList(3L, 3L), 1598.00));
            orderRepository.save(new Order(null, "Ana Oliveira", java.util.Arrays.asList(2L), 549.90));
            orderRepository.save(new Order(null, "Carlos Souza", java.util.Arrays.asList(6L, 6L, 6L), 1799.70));

            logger.info("Database seeded successfully!");
            logger.info("Created {} products", productRepository.count());
            logger.info("Created {} orders", orderRepository.count());
        };
    }
}
