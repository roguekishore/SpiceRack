package com.example.springapp.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.springapp.entities.Grocery;
import com.example.springapp.entities.Inventory;
import com.example.springapp.entities.InventoryGrocery;
import com.example.springapp.repositories.GroceryRepository;
import com.example.springapp.repositories.InventoryGroceryRepository;
import com.example.springapp.repositories.InventoryRepository;

import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

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

    public InventoryGrocery updateInventoryItemQuantity(Long inventoryId, Long groceryId, Double quantity) {
        InventoryGrocery inventoryGrocery = inventoryGroceryRepository.findByInventoryIdAndGroceryId(inventoryId, groceryId)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));

        inventoryGrocery.setQuantity(quantity);
        return inventoryGroceryRepository.save(inventoryGrocery);
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
}