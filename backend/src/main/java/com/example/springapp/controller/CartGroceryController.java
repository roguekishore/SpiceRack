package com.example.springapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.springapp.entities.CartGrocery;
import com.example.springapp.services.CartGroceryService;

import java.util.List;

@RestController
@RequestMapping("/api/carts/{cartId}/items")
public class CartGroceryController {

    private final CartGroceryService cartGroceryService;

    @Autowired
    public CartGroceryController(CartGroceryService cartGroceryService) {
        this.cartGroceryService = cartGroceryService;
    }

    @GetMapping
    public ResponseEntity<List<CartGrocery>> getCartItems(@PathVariable Long cartId) {
        List<CartGrocery> cartItems = cartGroceryService.getCartItemsByCartId(cartId);
        return ResponseEntity.ok(cartItems);
    }

    @PostMapping("/add/{groceryId}")
    public ResponseEntity<CartGrocery> addGroceryToCart(@PathVariable Long cartId, @PathVariable Long groceryId) {
        CartGrocery cartGrocery = cartGroceryService.addGroceryToCart(cartId, groceryId);
        return ResponseEntity.ok(cartGrocery);
    }

    @PutMapping("/modify/{groceryId}")
    public ResponseEntity<CartGrocery> updateCartItemQuantity(@PathVariable Long cartId, @PathVariable Long groceryId, @RequestParam Double quantity) {
        CartGrocery cartGrocery = cartGroceryService.updateCartItemQuantity(cartId, groceryId, quantity);
        return ResponseEntity.ok(cartGrocery);
    }
    
    @DeleteMapping("/remove/{groceryId}")
    public ResponseEntity<Void> removeGroceryFromCart(@PathVariable Long cartId, @PathVariable Long groceryId) {
        cartGroceryService.removeGroceryFromCart(cartId, groceryId);
        return ResponseEntity.noContent().build();
    }
}