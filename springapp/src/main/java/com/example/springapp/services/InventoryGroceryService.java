package com.example.springapp.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.springapp.dto.InventoryItemDTO;
import com.example.springapp.dto.InventoryResponseDTO;
import com.example.springapp.entities.Grocery;
import com.example.springapp.entities.Inventory;
import com.example.springapp.entities.InventoryGrocery;
import com.example.springapp.repositories.GroceryRepository;
import com.example.springapp.repositories.InventoryGroceryRepository;
import com.example.springapp.repositories.InventoryRepository;

import jakarta.transaction.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class InventoryGroceryService {

    private final InventoryGroceryRepository inventoryGroceryRepository;
    private final InventoryRepository inventoryRepository;
    private final GroceryRepository groceryRepository;

    @Autowired
    public InventoryGroceryService(InventoryGroceryRepository inventoryGroceryRepository, InventoryRepository inventoryRepository, GroceryRepository groceryRepository) {
        this.inventoryGroceryRepository = inventoryGroceryRepository;
        this.inventoryRepository = inventoryRepository;
        this.groceryRepository = groceryRepository;
    }

    public List<InventoryGrocery> getInventoryItemsByInventoryId(Long inventoryId) {
        return inventoryGroceryRepository.findByInventoryId(inventoryId);
    }

    public InventoryGrocery addGroceryToInventory(Long inventoryId, Long groceryId, Double quantity) {
        Inventory inventory = inventoryRepository.findById(inventoryId).orElseThrow(() -> new RuntimeException("Inventory not found"));
        Grocery grocery = groceryRepository.findById(groceryId).orElseThrow(() -> new RuntimeException("Grocery not found"));

        Optional<InventoryGrocery> existingItem = inventoryGroceryRepository.findByInventoryIdAndGroceryId(inventoryId, groceryId);

        if (existingItem.isPresent()) {
            InventoryGrocery inventoryGrocery = existingItem.get();
            inventoryGrocery.setQuantity(inventoryGrocery.getQuantity() + quantity);
            return inventoryGroceryRepository.save(inventoryGrocery);
        } else {
            InventoryGrocery inventoryGrocery = new InventoryGrocery();
            inventoryGrocery.setInventory(inventory);
            inventoryGrocery.setGrocery(grocery);
            inventoryGrocery.setQuantity(quantity);
            return inventoryGroceryRepository.save(inventoryGrocery);
        }
    }

    /**
     * OPTIMIZED: Add grocery to inventory using single-fetch pattern
     * Returns DTO for smaller payload
     */
    @Transactional
    public InventoryItemDTO addGroceryToInventoryOptimized(Long inventoryId, Long groceryId, Double quantity) {
        // Fetch inventory with all items in single query
        Inventory inventory = inventoryRepository.findByIdWithItems(inventoryId)
            .orElseThrow(() -> new RuntimeException("Inventory not found"));
        
        // Check for existing item in-memory (no additional query)
        Optional<InventoryGrocery> existingItem = inventory.getInventoryGroceries().stream()
            .filter(ig -> ig.getGrocery().getId().equals(groceryId))
            .findFirst();

        InventoryGrocery inventoryGrocery;
        
        if (existingItem.isPresent()) {
            inventoryGrocery = existingItem.get();
            inventoryGrocery.setQuantity(inventoryGrocery.getQuantity() + quantity);
        } else {
            Grocery grocery = groceryRepository.findById(groceryId)
                .orElseThrow(() -> new RuntimeException("Grocery not found"));
            
            inventoryGrocery = new InventoryGrocery();
            inventoryGrocery.setInventory(inventory);
            inventoryGrocery.setGrocery(grocery);
            inventoryGrocery.setQuantity(quantity);
            inventory.getInventoryGroceries().add(inventoryGrocery);
        }
        
        InventoryGrocery saved = inventoryGroceryRepository.save(inventoryGrocery);
        return mapToDTO(saved);
    }

    public InventoryGrocery updateInventoryItemQuantity(Long inventoryId, Long groceryId, Double quantity) {
        InventoryGrocery inventoryGrocery = inventoryGroceryRepository.findByInventoryIdAndGroceryId(inventoryId, groceryId)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));

        inventoryGrocery.setQuantity(quantity);
        return inventoryGroceryRepository.save(inventoryGrocery);
    }

    /**
     * OPTIMIZED: Update inventory item quantity returning DTO
     */
    @Transactional
    public InventoryItemDTO updateInventoryItemQuantityOptimized(Long inventoryId, Long groceryId, Double quantity) {
        InventoryGrocery inventoryGrocery = inventoryGroceryRepository.findByInventoryIdAndGroceryId(inventoryId, groceryId)
            .orElseThrow(() -> new RuntimeException("Inventory item not found"));
        inventoryGrocery.setQuantity(quantity);
        InventoryGrocery saved = inventoryGroceryRepository.save(inventoryGrocery);
        return mapToDTO(saved);
    }

    @Transactional
    public void removeGroceryFromInventory(Long inventoryId, Long groceryId) {
        inventoryGroceryRepository.deleteByInventoryIdAndGroceryId(inventoryId, groceryId);
    }

    public void removeQuantityFromInventory(Long inventoryId, Long groceryId, Double quantityToRemove) {
        InventoryGrocery inventoryGrocery = inventoryGroceryRepository.findByInventoryIdAndGroceryId(inventoryId, groceryId)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));

        Double currentQuantity = inventoryGrocery.getQuantity();
        if (currentQuantity >= quantityToRemove) {
            inventoryGrocery.setQuantity(currentQuantity - quantityToRemove);
            inventoryGroceryRepository.save(inventoryGrocery);
        } else {
            throw new RuntimeException("Insufficient quantity in inventory");
        }
    }

    /**
     * OPTIMIZED: Remove quantity returning DTO
     */
    @Transactional
    public InventoryItemDTO removeQuantityFromInventoryOptimized(Long inventoryId, Long groceryId, Double quantityToRemove) {
        InventoryGrocery inventoryGrocery = inventoryGroceryRepository.findByInventoryIdAndGroceryId(inventoryId, groceryId)
            .orElseThrow(() -> new RuntimeException("Inventory item not found"));

        Double currentQuantity = inventoryGrocery.getQuantity();
        if (currentQuantity >= quantityToRemove) {
            inventoryGrocery.setQuantity(currentQuantity - quantityToRemove);
            InventoryGrocery saved = inventoryGroceryRepository.save(inventoryGrocery);
            return mapToDTO(saved);
        } else {
            throw new RuntimeException("Insufficient quantity in inventory");
        }
    }

    /**
     * OPTIMIZED: Get inventory with all items as DTO
     */
    public InventoryResponseDTO getInventoryWithItemsOptimized(Long inventoryId) {
        Inventory inventory = inventoryRepository.findByIdWithItems(inventoryId)
            .orElseThrow(() -> new RuntimeException("Inventory not found"));
        return mapInventoryToDTO(inventory);
    }

    /**
     * OPTIMIZED: Get inventory by user ID as DTO
     */
    public InventoryResponseDTO getInventoryByUserIdOptimized(Long userId) {
        Inventory inventory = inventoryRepository.findByUserId(userId);
        if (inventory == null) {
            return null;
        }
        return mapInventoryToDTO(inventory);
    }

    // ============= DTO Mapping Helpers =============
    
    private InventoryItemDTO mapToDTO(InventoryGrocery ig) {
        Grocery g = ig.getGrocery();
        InventoryItemDTO dto = new InventoryItemDTO();
        dto.setId(ig.getId());
        dto.setGroceryId(g.getId());
        dto.setGroceryName(g.getName());
        dto.setGroceryPrice(g.getPrice());
        dto.setGroceryUnit(g.getUnit());
        dto.setGroceryCategory(g.getCategory());
        dto.setGroceryType(g.getType());
        dto.setGroceryImageUrl(g.getImageUrl());
        dto.setQuantity(ig.getQuantity());
        return dto;
    }
    
    private InventoryResponseDTO mapInventoryToDTO(Inventory inventory) {
        InventoryResponseDTO dto = new InventoryResponseDTO();
        dto.setId(inventory.getId());
        dto.setUserId(inventory.getUser() != null ? inventory.getUser().getId() : null);
        
        List<InventoryItemDTO> items = new ArrayList<>();
        if (inventory.getInventoryGroceries() != null) {
            items = inventory.getInventoryGroceries().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        }
        dto.setItems(items);
        
        return dto;
    }
}