package com.example.springapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.springapp.entities.Inventory;
import com.example.springapp.entities.InventoryGrocery;
import com.example.springapp.services.InventoryGroceryService;
import com.example.springapp.services.InventoryService;
import com.example.springapp.services.UnitConversionService;

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

    @PostMapping("/{inventoryId}/items/{groceryId}")
    public ResponseEntity<InventoryGrocery> addInventoryItem(@PathVariable Long inventoryId, @PathVariable Long groceryId, @RequestParam Double quantity) {
        return ResponseEntity.ok(inventoryGroceryService.addGroceryToInventory(inventoryId, groceryId, quantity));
    }

    @PutMapping("/{inventoryId}/items/{groceryId}")
    public ResponseEntity<InventoryGrocery> updateInventoryItem(@PathVariable Long inventoryId, @PathVariable Long groceryId, @RequestParam Double quantity) {
        return ResponseEntity.ok(inventoryGroceryService.updateInventoryItemQuantity(inventoryId, groceryId, quantity));
    }

    @DeleteMapping("/{inventoryId}/items/{groceryId}")
    public ResponseEntity<Void> removeInventoryItem(@PathVariable Long inventoryId, @PathVariable Long groceryId) {
        inventoryGroceryService.removeGroceryFromInventory(inventoryId, groceryId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{inventoryId}/items/{groceryId}/removeQuantity")
    public ResponseEntity<Void> removeQuantity(@PathVariable Long inventoryId, @PathVariable Long groceryId, @RequestParam Double quantity) {
        inventoryGroceryService.removeQuantityFromInventory(inventoryId, groceryId, quantity);
        return ResponseEntity.ok().build();
    }

    @Autowired
    private UnitConversionService unitConversionService;

    @GetMapping("/convert")
    public Map<String, Object> convert(@RequestParam double quantity, @RequestParam String fromUnit,
            @RequestParam String toUnit) throws IOException, InterruptedException {
        return unitConversionService.convertUnits(quantity, fromUnit, toUnit);
    }
}