package com.example.springapp.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.springapp.entities.Grocery;
import com.example.springapp.repositories.GroceryRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class GroceryService {

    private final GroceryRepository groceryRepository;

    @Autowired
    public GroceryService(GroceryRepository groceryRepository) {
        this.groceryRepository = groceryRepository;
    }

    public Grocery createGrocery(Grocery grocery) {
        return groceryRepository.save(grocery);
    }

    public List<Grocery> createGroceries(List<Grocery> groceries) {
        return groceryRepository.saveAll(groceries);
    }

    public Grocery getGrocery(long id) {
        return groceryRepository.findById(id).orElseThrow(EntityNotFoundException::new);
    }

    public Grocery updateGrocery(long groceryId, Grocery grocery) {
        Grocery existingGrocery = groceryRepository.findById(groceryId)
                .orElseThrow(() -> new EntityNotFoundException("Grocery not found with ID"));
        existingGrocery.setId(grocery.getId());
        existingGrocery.setName(grocery.getName());
        existingGrocery.setPrice(grocery.getPrice());
        return groceryRepository.save(existingGrocery);
    }

    public void deleteGrocery(Long groceryId) {
        if (!groceryRepository.existsById(groceryId)) {
            throw new EntityNotFoundException("Grocery not present");
        }
        groceryRepository.deleteById(groceryId);
    }

    public Page<Grocery> searchGroceries(String name, Pageable pageable) {
        return groceryRepository.findByNameContaining(name, pageable);
    }

    // custom methods
    public List<Grocery> getGroceries() {
        return groceryRepository.findAll();
    }

    public Grocery updateItemDetails(Long id, String category, String type, String unit, String imageUrl,
            Double price) {
        Optional<Grocery> optionalGrocery = groceryRepository.findById(id);

        if (optionalGrocery.isPresent()) {
            Grocery grocery = optionalGrocery.get();

            if (category != null) {
                grocery.setCategory(category);
            }
            if (type != null) {
                grocery.setType(type);
            }
            if (unit != null) {
                grocery.setUnit(unit);
            }
            if (imageUrl != null) {
                grocery.setImageUrl(imageUrl);
            }
            if (price != null) {
                grocery.setPrice(price);
            }

            return groceryRepository.save(grocery);
        } else {
            return null;
        }
    }

    public Page<Grocery> getPaginatedGroceries(Pageable pageable, String name, String type, String category) {
        if (name != null) {
            name = name.toLowerCase();
        }

        if ((type == null || type.equals("All")) && (category == null || category.equals("All"))){
            if (name == null){
                return groceryRepository.findAll(pageable);
            } else {
                return groceryRepository.findByNameContainingIgnoreCase(name, pageable);
            }
        } else if ((type == null || type.equals("All")) && (category != null && !category.equals("All"))){
            if (name == null){
                return groceryRepository.findByCategory(category, pageable);
            } else {
                return groceryRepository.findByCategoryAndNameContainingIgnoreCase(category, name, pageable);
            }
        } else if ((type != null && !type.equals("All")) && (category == null || category.equals("All"))){
            if (name == null){
                return groceryRepository.findByType(type, pageable);
            } else {
                return groceryRepository.findByTypeAndNameContainingIgnoreCase(type, name, pageable);
            }
        } else {
            if (name == null){
                return groceryRepository.findByTypeAndCategory(type, category, pageable);
            } else {
                return groceryRepository.findByTypeAndCategoryAndNameContainingIgnoreCase(type, category, name, pageable);
            }
        }
    }

}