package com.example.springapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Flattened DTO for cart items - avoids returning heavy Grocery entity metadata
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {
    private Long id;           // CartGrocery ID
    private Long groceryId;
    private String groceryName;
    private Double groceryPrice;
    private String groceryUnit;
    private String groceryCategory;
    private String groceryType;
    private String groceryImageUrl;
    private Double quantity;
    
    // Computed field for convenience
    private Double subtotal;
    
    public Double getSubtotal() {
        return (groceryPrice != null && quantity != null) ? groceryPrice * quantity : 0.0;
    }
}
