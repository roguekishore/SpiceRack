package com.example.springapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Flattened DTO for order items
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {
    private Long id;           // OrderGrocery ID
    private Long groceryId;
    private String groceryName;
    private Double groceryPrice;
    private String groceryUnit;
    private String groceryCategory;
    private String groceryImageUrl;
    private Double quantity;
    private Double subtotal;
    
    public Double getSubtotal() {
        return (groceryPrice != null && quantity != null) ? groceryPrice * quantity : 0.0;
    }
}
