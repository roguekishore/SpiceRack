package com.example.springapp.dto;

import lombok.Data;

@Data
public class RecipeGroceryDTO {
    private Long id;
    private GroceryDTO grocery;
    private double quantity;
    private String unit;
}