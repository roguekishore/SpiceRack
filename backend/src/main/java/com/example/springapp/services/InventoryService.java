package com.example.springapp.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.springapp.entities.Inventory;
import com.example.springapp.entities.User;
import com.example.springapp.repositories.InventoryRepository;
import com.example.springapp.repositories.UserRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;

    @Autowired
    public InventoryService(InventoryRepository inventoryRepository, UserRepository userRepository) {
        this.inventoryRepository = inventoryRepository;
        this.userRepository = userRepository;
    }

    public Inventory createInventory(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Inventory inventory = new Inventory();
        inventory.setUser(user);
        return inventoryRepository.save(inventory);
    }

    public Inventory getInventoryById(Long inventoryId) {
        return inventoryRepository.findById(inventoryId).orElseThrow(EntityNotFoundException::new);
    }

    public Inventory getInventoryByUserId(Long userId) {
        return inventoryRepository.findByUserId(userId);
    }

    public void deleteInventory(Long inventoryId) {
        inventoryRepository.deleteById(inventoryId);
    }
}