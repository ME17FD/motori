package com.motori.gateway.repository;

import com.motori.gateway.model.Log;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LogRepository extends JpaRepository<Log, Long> {

    List<Log> findByLevel(Log.LogLevel level);
    List<Log> findByUserEmail(String userEmail);
    List<Log> findByTimestampBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<Log> findByLevelAndTimestampBetween(Log.LogLevel level, LocalDateTime startDate, LocalDateTime endDate);
    List<Log> findByMessageContaining(String keyword);
    Page<Log> findAllByOrderByTimestampDesc(Pageable pageable);
    Page<Log> findByLevelOrderByTimestampDesc(Log.LogLevel level, Pageable pageable);

    @Query("SELECT l FROM Log l WHERE l.timestamp >= :startTime ORDER BY l.timestamp DESC")
    List<Log> findRecentLogs(@Param("startTime") LocalDateTime startTime);

    long countByLevel(Log.LogLevel level);

    @Query("SELECT l FROM Log l WHERE l.level = 'ERROR' ORDER BY l.timestamp DESC")
    List<Log> findErrorLogs();
}
