package com.example.springapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Flattened DTO for inventory items - avoids returning heavy Grocery entity metadata
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItemDTO {
    private Long id;           // InventoryGrocery ID
    private Long groceryId;
    private String groceryName;
    private Double groceryPrice;
    private String groceryUnit;
    private String groceryCategory;
    private String groceryType;
    private String groceryImageUrl;
    private Double quantity;
}
