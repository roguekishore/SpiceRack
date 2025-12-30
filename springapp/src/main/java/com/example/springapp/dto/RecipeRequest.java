package com.example.springapp.dto;

import lombok.Data;

import java.util.List;

import com.example.springapp.entities.Recipes;

@Data
public class RecipeRequest {
    private Recipes recipe;
    private List<GroceryRequest> groceryRequests;
    private Long userId;
}