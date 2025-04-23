package com.example.springapp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.springapp.entities.Inventory;

public interface InventoryRepository extends JpaRepository<Inventory , Long> {
    Inventory findByUserId(Long userId);
} 