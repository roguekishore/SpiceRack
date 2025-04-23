package com.example.springapp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.springapp.dto.RecipeRequest;
import com.example.springapp.entities.Recipes;
import com.example.springapp.repositories.UserRepository;
import com.example.springapp.services.RecipeService;

@RestController
@RequestMapping("/api/recipes")
public class RecipesController {

    @Autowired
    private RecipeService recipeService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Recipes> createRecipeWithGroceries(@RequestBody RecipeRequest recipeRequest) {
        Recipes savedRecipe = recipeService.createRecipeWithGroceries(
                recipeRequest.getRecipe(),
                recipeRequest.getGroceryRequests(),
                recipeRequest.getUserId()
        );
        return new ResponseEntity<>(savedRecipe, HttpStatus.CREATED);
    }

    @GetMapping("/{recipeId}")
    public ResponseEntity<Recipes> getRecipe(@PathVariable Long recipeId) {
        Recipes recipe = recipeService.getRecipeById(recipeId);
        if (recipe == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(recipe, HttpStatus.OK);
    }

    @GetMapping
    public List<Recipes> getRecipes() {
        return recipeService.getAllRecipes();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Recipes>> getRecipesByUserId(@PathVariable Long userId) {
        List<Recipes> recipes = recipeService.getRecipesByUserId(userId);
        if (recipes.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(recipes, HttpStatus.OK);
    }
}