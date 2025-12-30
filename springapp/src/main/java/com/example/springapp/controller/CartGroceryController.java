package com.example.springapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.springapp.dto.CartItemDTO;
import com.example.springapp.dto.CartResponseDTO;
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
    
    /**
     * OPTIMIZED: Get all cart items as flattened DTOs using single JOIN FETCH query.
     * Reduces response payload size and eliminates N+1 queries.
     */
    @GetMapping("/optimized")
    public ResponseEntity<CartResponseDTO> getCartItemsOptimized(@PathVariable Long cartId) {
        CartResponseDTO cart = cartGroceryService.getCartWithItemsOptimized(cartId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/add/{groceryId}")
    public ResponseEntity<CartGrocery> addGroceryToCart(@PathVariable Long cartId, @PathVariable Long groceryId) {
        CartGrocery cartGrocery = cartGroceryService.addGroceryToCart(cartId, groceryId);
        return ResponseEntity.ok(cartGrocery);
    }
    
    /**
     * OPTIMIZED: Add grocery to cart using single-fetch pattern.
     * 
     * Performance improvement:
     * - Before: 4 sequential queries (~320ms with 80ms latency per query)
     * - After: 1-2 queries (~80-160ms)
     * 
     * Returns flattened DTO for smaller payload.
     */
    @PostMapping("/add/{groceryId}/optimized")
    public ResponseEntity<CartItemDTO> addGroceryToCartOptimized(
            @PathVariable Long cartId, 
            @PathVariable Long groceryId) {
        CartItemDTO cartItem = cartGroceryService.addGroceryToCartOptimized(cartId, groceryId);
        return ResponseEntity.ok(cartItem);
    }

    @PutMapping("/modify/{groceryId}")
    public ResponseEntity<CartGrocery> updateCartItemQuantity(@PathVariable Long cartId, @PathVariable Long groceryId, @RequestParam Double quantity) {
        CartGrocery cartGrocery = cartGroceryService.updateCartItemQuantity(cartId, groceryId, quantity);
        return ResponseEntity.ok(cartGrocery);
    }
    
    /**
     * OPTIMIZED: Update quantity returning DTO
     */
    @PutMapping("/modify/{groceryId}/optimized")
    public ResponseEntity<CartItemDTO> updateCartItemQuantityOptimized(
            @PathVariable Long cartId, 
            @PathVariable Long groceryId, 
            @RequestParam Double quantity) {
        CartItemDTO cartItem = cartGroceryService.updateCartItemQuantityOptimized(cartId, groceryId, quantity);
        return ResponseEntity.ok(cartItem);
    }
    
    @DeleteMapping("/remove/{groceryId}")
    public ResponseEntity<Void> removeGroceryFromCart(@PathVariable Long cartId, @PathVariable Long groceryId) {
        cartGroceryService.removeGroceryFromCart(cartId, groceryId);
        return ResponseEntity.noContent().build();
    }
}