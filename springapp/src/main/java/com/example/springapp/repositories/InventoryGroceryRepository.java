package com.example.springapp.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.springapp.entities.InventoryGrocery;

public interface InventoryGroceryRepository extends JpaRepository<InventoryGrocery, Long> {
    
    /**
     * Fetch inventory items with grocery data eagerly loaded
     */
    @Query("SELECT ig FROM InventoryGrocery ig " +
           "LEFT JOIN FETCH ig.grocery " +
           "WHERE ig.inventory.id = :inventoryId")
    List<InventoryGrocery> findByInventoryId(@Param("inventoryId") Long inventoryId);

    /**
     * Fetch single inventory item with grocery data eagerly loaded
     */
    @Query("SELECT ig FROM InventoryGrocery ig " +
           "LEFT JOIN FETCH ig.grocery " +
           "WHERE ig.inventory.id = :inventoryId AND ig.grocery.id = :groceryId")
    Optional<InventoryGrocery> findByInventoryIdAndGroceryId(
        @Param("inventoryId") Long inventoryId, 
        @Param("groceryId") Long groceryId);
    
    @Modifying
    @Query("DELETE FROM InventoryGrocery ig WHERE ig.inventory.id = :inventoryId AND ig.grocery.id = :groceryId")
    void deleteByInventoryIdAndGroceryId(
        @Param("inventoryId") Long inventoryId, 
        @Param("groceryId") Long groceryId);
}
