package com.standupflow.repository;

import com.standupflow.model.UserMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserMetricsRepository extends JpaRepository<UserMetrics, Long> {

    @Query(value = "SELECT * FROM tblUser_metrics WHERE user_id = :userId LIMIT 1", nativeQuery = true)
    Optional<UserMetrics> findByUserId(String userId);
}
