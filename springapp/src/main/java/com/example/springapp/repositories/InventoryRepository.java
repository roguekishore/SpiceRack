package com.example.springapp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.springapp.entities.Inventory;

import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    
    /**
     * Fetch inventory with all items eagerly loaded to avoid lazy initialization exceptions
     */
    @Query("SELECT i FROM Inventory i " +
           "LEFT JOIN FETCH i.inventoryGroceries ig " +
           "LEFT JOIN FETCH ig.grocery " +
           "WHERE i.user.id = :userId")
    Inventory findByUserId(@Param("userId") Long userId);
    
    /**
     * Fetch inventory by ID with all items eagerly loaded
     */
    @Query("SELECT i FROM Inventory i " +
           "LEFT JOIN FETCH i.inventoryGroceries ig " +
           "LEFT JOIN FETCH ig.grocery " +
           "WHERE i.id = :id")
    Optional<Inventory> findByIdWithItems(@Param("id") Long id);
} 