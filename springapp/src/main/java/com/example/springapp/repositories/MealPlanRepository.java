package com.example.springapp.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.springapp.entities.MealPlan;

public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {
    Optional<MealPlan> findByUserIdAndDate(Long userId, LocalDate date);
    List<MealPlan> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    void deleteByUserIdAndDate(Long userId, LocalDate date);
}