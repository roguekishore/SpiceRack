package com.example.springapp.dto;

import lombok.Data;

@Data
public class GroceryRequest {
    private Long groceryId;
    private double quantity;
    private String unit;
}