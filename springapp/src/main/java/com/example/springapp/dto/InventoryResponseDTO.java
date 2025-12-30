package com.example.springapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Lightweight Inventory response DTO - excludes heavy User entity
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponseDTO {
    private Long id;           // Inventory ID
    private Long userId;       // Only the user ID, not the full User entity
    private List<InventoryItemDTO> items;
    private Integer itemCount;
    
    public Integer getItemCount() {
        return items != null ? items.size() : 0;
    }
}
