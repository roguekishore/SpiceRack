package com.example.springapp.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.springapp.entities.Orders;

public interface OrderRepository extends JpaRepository<Orders , Long>{
    List<Orders> findByUserId(Long userId); 
}
