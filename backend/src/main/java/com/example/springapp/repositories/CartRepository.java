package com.example.springapp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.springapp.entities.Cart;

public interface CartRepository extends JpaRepository<Cart , Long>{
    Cart findByUserId(Long userId);
}