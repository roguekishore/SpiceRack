package com.example.springapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.springapp.entities.MealPlan;
import com.example.springapp.services.MealPlanService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/mealplans")
public class MealPlanController {

    @Autowired
    private MealPlanService mealPlanService;

    @PostMapping
    public ResponseEntity<MealPlan> createMealPlan(@RequestBody MealPlan mealPlan) {
        MealPlan savedMealPlan = mealPlanService.saveMealPlan(mealPlan);
        return ResponseEntity.ok(savedMealPlan);
    }

    @GetMapping
    public ResponseEntity<Optional<MealPlan>> getMealPlan(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Optional<MealPlan> mealPlans = mealPlanService.getMealPlanByUserIdAndDate(userId, date);
        return ResponseEntity.ok(mealPlans);
    }

    @GetMapping("/range")
    public ResponseEntity<List<MealPlan>> getMealPlansByUserAndDateRange(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<MealPlan> mealPlans = mealPlanService.getMealPlansByUserAndDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(mealPlans);
    }

    @DeleteMapping
    public ResponseEntity<String> deleteMealPlan(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        Optional<MealPlan> mealPlan = mealPlanService.getMealPlanByUserIdAndDate(userId, date);

        if(mealPlan.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Meal plan not found");
        }

        mealPlanService.deleteMealPlan(userId, date);

        return ResponseEntity.ok("Meal plan deleted successfully");
    }
}