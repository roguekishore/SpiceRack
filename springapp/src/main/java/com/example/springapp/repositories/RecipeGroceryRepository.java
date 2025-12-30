package com.example.springapp.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.springapp.entities.RecipeGrocery;
import com.example.springapp.entities.Recipes;

public interface RecipeGroceryRepository extends JpaRepository<RecipeGrocery, Long> {
    List<RecipeGrocery> findByRecipe(Recipes recipe);
}
