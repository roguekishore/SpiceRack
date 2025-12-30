package com.example.springapp.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.springapp.entities.Orders;

public interface OrderRepository extends JpaRepository<Orders, Long> {
    
    /**
     * Fetch orders with all items eagerly loaded to avoid lazy initialization exceptions
     */
    @Query("SELECT DISTINCT o FROM Orders o " +
           "LEFT JOIN FETCH o.orderGroceries og " +
           "LEFT JOIN FETCH og.grocery " +
           "WHERE o.user.id = :userId " +
           "ORDER BY o.date DESC")
    List<Orders> findByUserId(@Param("userId") Long userId);
    
    /**
     * Fetch single order by ID with all items eagerly loaded
     */
    @Query("SELECT o FROM Orders o " +
           "LEFT JOIN FETCH o.orderGroceries og " +
           "LEFT JOIN FETCH og.grocery " +
           "WHERE o.id = :id")
    Optional<Orders> findByIdWithItems(@Param("id") Long id);
}
