package com.motori.backoffice_service.service;

import com.motori.backoffice_service.dto.StatisticsDto;
import com.motori.backoffice_service.dto.TopProductDto;
import com.motori.backoffice_service.dto.TodaySummaryDto;
import com.motori.order.model.OrderStatus;
import com.motori.backoffice_service.repository.OrderItemRepository;
import com.motori.backoffice_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    @Transactional(readOnly = true)
    public StatisticsDto getDashboardStats() {
        return getDashboardStats(30, 10);
    }

    @Transactional(readOnly = true)
    public StatisticsDto getDashboardStats(int lastDays) {
        return getDashboardStats(lastDays, 10);
    }

    @Transactional(readOnly = true)
    public StatisticsDto getDashboardStats(int lastDays, int topProductsLimit) {
        long totalOrders = orderRepository.count();
        Map<String, Long> byStatus = orderRepository.countByStatusGroupBy().stream()
                .collect(Collectors.toMap(row -> ((OrderStatus) row[0]).name(), row -> (Long) row[1]));
        for (OrderStatus s : OrderStatus.values()) {
            byStatus.putIfAbsent(s.name(), 0L);
        }
        BigDecimal totalRevenue = orderRepository.sumTotalAmount() != null ? orderRepository.sumTotalAmount() : BigDecimal.ZERO;
        LocalDateTime since = LocalDateTime.now().minusDays(lastDays);
        long ordersInPeriod = orderRepository.countSince(since);
        BigDecimal revenueInPeriod = orderRepository.sumTotalAmountSince(since) != null ? orderRepository.sumTotalAmountSince(since) : BigDecimal.ZERO;
        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(lastDays);
        List<TopProductDto> topProducts = getTopProducts(lastDays, topProductsLimit);

        return StatisticsDto.builder()
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .ordersByStatus(byStatus)
                .ordersInPeriod(ordersInPeriod)
                .revenueInPeriod(revenueInPeriod)
                .periodFrom(from)
                .periodTo(to)
                .topProducts(topProducts)
                .build();
    }

    @Transactional(readOnly = true)
    public StatisticsDto getDashboardStats(LocalDate fromDate, LocalDate toDate, int topProductsLimit) {
        long totalOrders = orderRepository.count();
        Map<String, Long> byStatus = orderRepository.countByStatusGroupBy().stream()
                .collect(Collectors.toMap(row -> ((OrderStatus) row[0]).name(), row -> (Long) row[1]));
        for (OrderStatus s : OrderStatus.values()) {
            byStatus.putIfAbsent(s.name(), 0L);
        }
        BigDecimal totalRevenue = orderRepository.sumTotalAmount() != null ? orderRepository.sumTotalAmount() : BigDecimal.ZERO;
        LocalDateTime from = LocalDateTime.of(fromDate, LocalTime.MIN);
        LocalDateTime to = LocalDateTime.of(toDate.plusDays(1), LocalTime.MIN);
        long ordersInPeriod = orderRepository.countBetween(from, to);
        BigDecimal revenueInPeriod = orderRepository.sumTotalAmountBetween(from, to) != null ? orderRepository.sumTotalAmountBetween(from, to) : BigDecimal.ZERO;
        List<TopProductDto> topProducts = getTopProductsBetween(from, to, topProductsLimit);

        return StatisticsDto.builder()
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .ordersByStatus(byStatus)
                .ordersInPeriod(ordersInPeriod)
                .revenueInPeriod(revenueInPeriod)
                .periodFrom(fromDate)
                .periodTo(toDate)
                .topProducts(topProducts)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TopProductDto> getTopProducts(int lastDays, int limit) {
        LocalDateTime since = LocalDateTime.now().minusDays(lastDays);
        return getTopProductsBetween(since, LocalDateTime.now(), limit);
    }

    @Transactional(readOnly = true)
    public List<TopProductDto> getTopProductsBetween(LocalDateTime from, LocalDateTime to, int limit) {
        List<Object[]> rows = orderItemRepository.findTopProductsBetween(from, to, PageRequest.of(0, limit));
        return rows.stream()
                .map(row -> TopProductDto.builder()
                        .productId((Long) row[0])
                        .productName((String) row[1])
                        .quantitySold(((Number) row[2]).longValue())
                        .totalAmount((BigDecimal) row[3])
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public TodaySummaryDto getTodaySummary() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().plusDays(1).atStartOfDay();
        long ordersToday = orderRepository.countBetween(startOfDay, endOfDay);
        BigDecimal revenueToday = orderRepository.sumTotalAmountBetween(startOfDay, endOfDay) != null ? orderRepository.sumTotalAmountBetween(startOfDay, endOfDay) : BigDecimal.ZERO;
        long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        long toShipOrders = orderRepository.countByStatus(OrderStatus.CONFIRMED) + orderRepository.countByStatus(OrderStatus.PROCESSING);

        return TodaySummaryDto.builder()
                .ordersToday(ordersToday)
                .revenueToday(revenueToday)
                .pendingOrders(pendingOrders)
                .toShipOrders(toShipOrders)
                .build();
    }
}
