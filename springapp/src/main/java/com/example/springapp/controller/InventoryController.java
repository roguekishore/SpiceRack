package com.example.springapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.springapp.dto.InventoryItemDTO;
import com.example.springapp.dto.InventoryResponseDTO;
import com.example.springapp.entities.Inventory;
import com.example.springapp.entities.InventoryGrocery;
import com.example.springapp.services.InventoryGroceryService;
import com.example.springapp.services.InventoryService;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventories")
public class InventoryController {

    private final InventoryService inventoryService;
    private final InventoryGroceryService inventoryGroceryService;

    @Autowired
    public InventoryController(InventoryService inventoryService, InventoryGroceryService inventoryGroceryService) {
        this.inventoryService = inventoryService;
        this.inventoryGroceryService = inventoryGroceryService;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<Inventory> createInventory(@PathVariable Long userId) {
        return ResponseEntity.ok(inventoryService.createInventory(userId));
    }

    @GetMapping("/{inventoryId}")
    public ResponseEntity<Inventory> getInventoryById(@PathVariable Long inventoryId) {
        return ResponseEntity.ok(inventoryService.getInventoryById(inventoryId));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<Inventory> getInventoryByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(inventoryService.getInventoryByUserId(userId));
    }
    
    /**
     * OPTIMIZED: Get inventory by user ID with flattened DTO response
     */
    @GetMapping("/users/{userId}/optimized")
    public ResponseEntity<InventoryResponseDTO> getInventoryByUserIdOptimized(@PathVariable Long userId) {
        InventoryResponseDTO inventory = inventoryGroceryService.getInventoryByUserIdOptimized(userId);
        return ResponseEntity.ok(inventory);
    }

    @DeleteMapping("/{inventoryId}")
    public ResponseEntity<Void> deleteInventory(@PathVariable Long inventoryId) {
        inventoryService.deleteInventory(inventoryId);
        return ResponseEntity.noContent().build();
    }

    // InventoryGrocery Endpoints
    @GetMapping("/{inventoryId}/items")
    public ResponseEntity<List<InventoryGrocery>> getInventoryItems(@PathVariable Long inventoryId) {
        return ResponseEntity.ok(inventoryGroceryService.getInventoryItemsByInventoryId(inventoryId));
    }
    
    /**
     * OPTIMIZED: Get inventory items as flattened DTOs
     */
    @GetMapping("/{inventoryId}/items/optimized")
    public ResponseEntity<InventoryResponseDTO> getInventoryItemsOptimized(@PathVariable Long inventoryId) {
        InventoryResponseDTO inventory = inventoryGroceryService.getInventoryWithItemsOptimized(inventoryId);
        return ResponseEntity.ok(inventory);
    }

    @PostMapping("/{inventoryId}/items/{groceryId}")
    public ResponseEntity<InventoryGrocery> addInventoryItem(@PathVariable Long inventoryId, @PathVariable Long groceryId, @RequestParam Double quantity) {
        return ResponseEntity.ok(inventoryGroceryService.addGroceryToInventory(inventoryId, groceryId, quantity));
    }
    
    /**
     * OPTIMIZED: Add item to inventory returning DTO
     */
    @PostMapping("/{inventoryId}/items/{groceryId}/optimized")
    public ResponseEntity<InventoryItemDTO> addInventoryItemOptimized(
            @PathVariable Long inventoryId, 
            @PathVariable Long groceryId, 
            @RequestParam Double quantity) {
        InventoryItemDTO item = inventoryGroceryService.addGroceryToInventoryOptimized(inventoryId, groceryId, quantity);
        return ResponseEntity.ok(item);
    }

    @PutMapping("/{inventoryId}/items/{groceryId}")
    public ResponseEntity<InventoryGrocery> updateInventoryItem(@PathVariable Long inventoryId, @PathVariable Long groceryId, @RequestParam Double quantity) {
        return ResponseEntity.ok(inventoryGroceryService.updateInventoryItemQuantity(inventoryId, groceryId, quantity));
    }
    
    /**
     * OPTIMIZED: Update inventory item returning DTO
     */
    @PutMapping("/{inventoryId}/items/{groceryId}/optimized")
    public ResponseEntity<InventoryItemDTO> updateInventoryItemOptimized(
            @PathVariable Long inventoryId, 
            @PathVariable Long groceryId, 
            @RequestParam Double quantity) {
        InventoryItemDTO item = inventoryGroceryService.updateInventoryItemQuantityOptimized(inventoryId, groceryId, quantity);
        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/{inventoryId}/items/{groceryId}")
    public ResponseEntity<Void> removeInventoryItem(@PathVariable Long inventoryId, @PathVariable Long groceryId) {
        inventoryGroceryService.removeGroceryFromInventory(inventoryId, groceryId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * OPTIMIZED: Remove inventory item returning success confirmation
     */
    @DeleteMapping("/{inventoryId}/items/{groceryId}/optimized")
    public ResponseEntity<Map<String, Object>> removeInventoryItemOptimized(
            @PathVariable Long inventoryId, 
            @PathVariable Long groceryId) {
        inventoryGroceryService.removeGroceryFromInventory(inventoryId, groceryId);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "groceryId", groceryId,
            "message", "Item removed from inventory"
        ));
    }

    @PutMapping("/{inventoryId}/items/{groceryId}/removeQuantity")
    public ResponseEntity<Void> removeQuantity(@PathVariable Long inventoryId, @PathVariable Long groceryId, @RequestParam Double quantity) {
        inventoryGroceryService.removeQuantityFromInventory(inventoryId, groceryId, quantity);
        return ResponseEntity.ok().build();
    }
    
    /**
     * OPTIMIZED: Remove quantity returning updated DTO
     */
    @PutMapping("/{inventoryId}/items/{groceryId}/removeQuantity/optimized")
    public ResponseEntity<InventoryItemDTO> removeQuantityOptimized(
            @PathVariable Long inventoryId, 
            @PathVariable Long groceryId, 
            @RequestParam Double quantity) {
        InventoryItemDTO item = inventoryGroceryService.removeQuantityFromInventoryOptimized(inventoryId, groceryId, quantity);
        return ResponseEntity.ok(item);
    }
}