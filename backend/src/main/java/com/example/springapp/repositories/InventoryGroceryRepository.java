package com.example.springapp.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.springapp.entities.InventoryGrocery;

public interface InventoryGroceryRepository extends JpaRepository<InventoryGrocery, Long> {
    List<InventoryGrocery> findByInventoryId(Long inventoryId);

    Optional<InventoryGrocery> findByInventoryIdAndGroceryId(Long inventoryId, Long GroceryId);
    
    void deleteByInventoryIdAndGroceryId(Long inventoryId, Long groceryId);
}
