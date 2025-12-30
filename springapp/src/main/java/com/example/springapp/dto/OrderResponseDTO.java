package com.example.springapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

/**
 * Lightweight Order response DTO - excludes heavy User entity
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {
    private Long id;           // Order ID
    private Long userId;       // Only the user ID, not the full User entity
    private Date date;
    private Double totalPrice;
    private List<OrderItemDTO> items;
    private Integer itemCount;
    
    public Integer getItemCount() {
        return items != null ? items.size() : 0;
    }
}
