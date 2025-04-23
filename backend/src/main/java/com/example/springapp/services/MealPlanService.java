package com.example.springapp.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.springapp.entities.MealPlan;
import com.example.springapp.repositories.MealPlanRepository;

import jakarta.transaction.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class MealPlanService {

    @Autowired
    private MealPlanRepository mealPlanRepository;

    public MealPlan saveMealPlan(MealPlan mealPlan) {
        Optional<MealPlan> existingMealPlanOptional = mealPlanRepository.findByUserIdAndDate(mealPlan.getUserId(), mealPlan.getDate());

        if (existingMealPlanOptional.isEmpty()) {
            return mealPlanRepository.save(mealPlan);
        } else {
            MealPlan existingMealPlan = existingMealPlanOptional.get();

            if (mealPlan.getBreakfastRecipeId() != null) {
                existingMealPlan.setBreakfastRecipeId(mealPlan.getBreakfastRecipeId());
            }
            if (mealPlan.getLunchRecipeId() != null) {
                existingMealPlan.setLunchRecipeId(mealPlan.getLunchRecipeId());
            }
            if (mealPlan.getDinnerRecipeId() != null) {
                existingMealPlan.setDinnerRecipeId(mealPlan.getDinnerRecipeId());
            }

            return mealPlanRepository.save(existingMealPlan);
        }
    }

    public Optional<MealPlan> getMealPlanByUserIdAndDate(Long userId, LocalDate date) {
        return mealPlanRepository.findByUserIdAndDate(userId, date);
    }

    public List<MealPlan> getMealPlansByUserAndDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return mealPlanRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
    }

    @Transactional
    public void deleteMealPlan(Long userId, LocalDate date) {
        mealPlanRepository.deleteByUserIdAndDate(userId, date);
    }
}