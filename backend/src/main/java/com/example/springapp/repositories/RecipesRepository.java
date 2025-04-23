package com.example.springapp.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.springapp.entities.Recipes;

public interface RecipesRepository extends JpaRepository<Recipes, Long>{
    List<Recipes> findByUserId(Long userId);
}
