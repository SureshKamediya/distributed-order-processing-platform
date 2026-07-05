package com.soperant.bookstore.orders.domain;

import org.springframework.data.jpa.repository.JpaRepository;

interface OrderEventRepository extends JpaRepository<OrderEventEntity, Long> {}
