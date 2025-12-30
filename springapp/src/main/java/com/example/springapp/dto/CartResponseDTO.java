package com.example.springapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Lightweight Cart response DTO - excludes heavy User entity and unnecessary metadata
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartResponseDTO {
    private Long id;           // Cart ID
    private Long userId;       // Only the user ID, not the full User entity
    private List<CartItemDTO> items;
    private Integer itemCount;
    private Double totalPrice;
    
    public Integer getItemCount() {
        return items != null ? items.size() : 0;
    }
    
    public Double getTotalPrice() {
        if (items == null) return 0.0;
        return items.stream()
            .mapToDouble(CartItemDTO::getSubtotal)
            .sum();
    }
}
