package com.example.springapp.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.springapp.dto.GroceryDTO;
import com.example.springapp.dto.GroceryRequest;
import com.example.springapp.dto.RecipeGroceryDTO;
import com.example.springapp.entities.Grocery;
import com.example.springapp.entities.RecipeGrocery;
import com.example.springapp.entities.Recipes;
import com.example.springapp.entities.User;
import com.example.springapp.repositories.GroceryRepository;
import com.example.springapp.repositories.RecipeGroceryRepository;
import com.example.springapp.repositories.RecipesRepository;
import com.example.springapp.repositories.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RecipeService {

    @Autowired
    private RecipesRepository recipesRepository;

    @Autowired
    private GroceryRepository groceryRepository;

    @Autowired
    private RecipeGroceryRepository recipeGroceryRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Recipes createRecipeWithGroceries(Recipes recipe, List<GroceryRequest> groceryRequests, Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            recipe.setUser(userOptional.get());
        } else {
            throw new RuntimeException("User not found with id: " + userId);
        }

        Recipes savedRecipe = recipesRepository.save(recipe);

        if (groceryRequests != null) {
            List<RecipeGrocery> recipeGroceries = new ArrayList<>();
            for (GroceryRequest request : groceryRequests) {
                Optional<Grocery> groceryOptional = groceryRepository.findById(request.getGroceryId());
                if (groceryOptional.isPresent()) {
                    Grocery grocery = groceryOptional.get();
                    RecipeGrocery recipeGrocery = new RecipeGrocery();
                    recipeGrocery.setRecipe(savedRecipe);
                    recipeGrocery.setGrocery(grocery);
                    recipeGrocery.setQuantity(request.getQuantity());
                    recipeGrocery.setUnit(request.getUnit());
                    recipeGroceries.add(recipeGrocery);
                }
            }
            recipeGroceryRepository.saveAll(recipeGroceries);
            savedRecipe.setRequiredGroceries(recipeGroceries);
        }

        return savedRecipe;
    }

    @Transactional
    public Recipes getRecipeById(Long id) {
        Optional<Recipes> recipeOptional = recipesRepository.findById(id);
        if (recipeOptional.isPresent()) {
            Recipes recipe = recipeOptional.get();
            List<RecipeGrocery> requiredGroceries = recipeGroceryRepository.findByRecipe(recipe);

            List<RecipeGroceryDTO> recipeGroceryDTOs = requiredGroceries.stream()
                    .map(this::convertToRecipeGroceryDTO)
                    .collect(Collectors.toList());

            recipe.setRequiredGroceries(requiredGroceries); 
            recipe.setRequiredGroceryDTOs(recipeGroceryDTOs);
            return recipe;
        }
        return null;
    }

    @Transactional
    public List<Recipes> getAllRecipes() {
        List<Recipes> recipes = recipesRepository.findAll();

        return recipes.stream()
                .peek(recipe -> {
                    List<RecipeGrocery> requiredGroceries = recipeGroceryRepository.findByRecipe(recipe);
                    recipe.setRequiredGroceries(requiredGroceries);

                    List<RecipeGroceryDTO> recipeGroceryDTOs = requiredGroceries.stream()
                            .map(this::convertToRecipeGroceryDTO)
                            .collect(Collectors.toList());

                    recipe.setRequiredGroceryDTOs(recipeGroceryDTOs);
                })
                .collect(Collectors.toList());
    }

    private RecipeGroceryDTO convertToRecipeGroceryDTO(RecipeGrocery recipeGrocery) {
        RecipeGroceryDTO dto = new RecipeGroceryDTO();
        dto.setId(recipeGrocery.getId());
        dto.setQuantity(recipeGrocery.getQuantity());
        dto.setUnit(recipeGrocery.getUnit());

        GroceryDTO groceryDTO = new GroceryDTO();
        if (recipeGrocery.getGrocery() != null) {
            groceryDTO.setId(recipeGrocery.getGrocery().getId());
            groceryDTO.setName(recipeGrocery.getGrocery().getName());
            groceryDTO.setImageUrl(recipeGrocery.getGrocery().getImageUrl());
        }
        dto.setGrocery(groceryDTO);

        return dto;
    }

    @Transactional
    public List<Recipes> getRecipesByUserId(Long userId) {
        List<Recipes> recipes = recipesRepository.findByUserId(userId);
        
        recipes.forEach(recipe -> {
            List<RecipeGrocery> requiredGroceries = recipeGroceryRepository.findByRecipe(recipe);
            recipe.setRequiredGroceries(requiredGroceries);

            List<RecipeGroceryDTO> recipeGroceryDTOs = requiredGroceries.stream()
                    .map(this::convertToRecipeGroceryDTO)
                    .collect(Collectors.toList());
            recipe.setRequiredGroceryDTOs(recipeGroceryDTOs);
        });

        return recipes;
    }
}