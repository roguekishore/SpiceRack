package com.example.springapp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.springapp.entities.CartGrocery;

import java.util.List;
import java.util.Optional;

public interface CartGroceryRepository extends JpaRepository<CartGrocery, Long> {

    @Query("SELECT c FROM CartGrocery c WHERE c.cart.id = :cart_id")
    List<CartGrocery> findByCartId(@Param("cart_id") Long cartId);

    @Query("SELECT c FROM CartGrocery c WHERE c.cart.id = :cart_id AND c.grocery.id = :grocery_id")
    Optional<CartGrocery> findByCartIdAndGroceryId(@Param("cart_id") Long cartId, @Param("grocery_id") Long groceryId);

    @Modifying
    @Query("DELETE FROM CartGrocery c WHERE c.cart.id = :cart_id AND c.grocery.id = :grocery_id")    
    void deleteByCartIdAndGroceryId(@Param("cart_id") Long cartId, @Param("grocery_id") Long groceryId);
}