package com.example.springapp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.springapp.entities.Grocery;
import com.example.springapp.repositories.GroceryRepository;
import com.example.springapp.services.GroceryService;

import lombok.Data;

@RestController
@RequestMapping("/api/groceries")
public class GroceryController {

    private final GroceryService groceryService;
    private final GroceryRepository groceryRepository;

    @Autowired
    public GroceryController(GroceryService groceryService,
            GroceryRepository groceryRepository) {
        this.groceryService = groceryService;
        this.groceryRepository = groceryRepository;
    }

    @PostMapping
    public Grocery createGrocery(@RequestBody Grocery grocery) {
        return groceryService.createGrocery(grocery);
    }

    @GetMapping("/{id}")
    public Grocery getGrocery(@PathVariable long id) {
        return groceryService.getGrocery(id);
    }

    @PutMapping("/{id}")
    public Grocery updateGrocery(@PathVariable long id, @RequestBody Grocery grocery) {
        return groceryService.updateGrocery(id, grocery);
    }

    @DeleteMapping("/{id}")
    public void deleteGrocery(@PathVariable Long id) {
        groceryService.deleteGrocery(id);
    }

    @GetMapping
    public Page<Grocery> getGroceries(@RequestParam(value = "name", required = false) String name, Pageable pageable) {
        if (name != null) {
            return groceryService.searchGroceries(name, pageable);
        } else {
            return groceryService.searchGroceries("", pageable);
        }
    }

    @PostMapping("/bulkadd")
    public List<Grocery> createListGroceries(@RequestBody List<Grocery> groceries) {
        return groceryService.createGroceries(groceries);
    }

    // custom controller methods
    @GetMapping("/all")
    public List<Grocery> getGroceries() {
        return groceryService.getGroceries();
    }

    @PatchMapping("/{id}/details")
    public Grocery updateItemDetails(@PathVariable Long id, @RequestBody ItemDetailsUpdateRequest request) {
        return groceryService.updateItemDetails(id, request.getCategory(), request.getType(), request.getUnit(),
                request.getImageUrl(), request.getPrice());
    }

    @Data
    public static class ItemDetailsUpdateRequest {
        private String category;
        private String type;
        private String unit;
        private String imageUrl;
        private Double price;
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<Grocery>> getPaginatedGroceries(
            @PageableDefault(sort = "id", direction = Sort.Direction.ASC) Pageable pageable,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "true") boolean ascending) {

        Sort sort = ascending ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        Page<Grocery> groceries = groceryService.getPaginatedGroceries(pageable, name, type, category);
        return ResponseEntity.ok(groceries);
    }

}