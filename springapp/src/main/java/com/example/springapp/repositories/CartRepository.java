package com.example.springapp.repositories;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.springapp.entities.Cart;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    
    /**
     * DEPRECATED: Use findByUserIdWithItemsAndGroceries instead to avoid lazy loading issues
     */
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.cartGroceries cg LEFT JOIN FETCH cg.grocery WHERE c.user.id = :userId")
    Cart findByUserId(@Param("userId") Long userId);
    
    /**
     * Fetch cart with all items and groceries in a SINGLE query using JOIN FETCH.
     * This eliminates the N+1 problem and reduces DB round-trips from ~7 to 1.
     * 
     * Critical for high-latency cross-region connections (Singapore -> Mumbai ~80ms)
     */
    @Query("SELECT c FROM Cart c " +
           "LEFT JOIN FETCH c.cartGroceries cg " +
           "LEFT JOIN FETCH cg.grocery " +
           "WHERE c.user.id = :userId")
    Optional<Cart> findByUserIdWithItemsAndGroceries(@Param("userId") Long userId);
    
    /**
     * Alternative using @EntityGraph for the same optimization
     */
    @EntityGraph(attributePaths = {"cartGroceries", "cartGroceries.grocery"})
    @Query("SELECT c FROM Cart c WHERE c.id = :cartId")
    Optional<Cart> findByIdWithItemsAndGroceries(@Param("cartId") Long cartId);
    
    /**
     * Optimized fetch by cart ID with all items eagerly loaded
     */
    @Query("SELECT c FROM Cart c " +
           "LEFT JOIN FETCH c.cartGroceries cg " +
           "LEFT JOIN FETCH cg.grocery " +
           "LEFT JOIN FETCH c.user " +
           "WHERE c.id = :cartId")
    Optional<Cart> findByIdWithAllData(@Param("cartId") Long cartId);
}