package com.example.springapp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.springapp.dto.OrderResponseDTO;
import com.example.springapp.entities.Cart;
import com.example.springapp.entities.Orders;
import com.example.springapp.services.CartService;

import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/carts")
public class CartController {

    private final CartService cartService;

    @Autowired
    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    //create with user id
    @PostMapping("/{userId}")
    public Cart createCart(@PathVariable Long userId) {
        return cartService.createCart(userId);
    }

    @GetMapping("{id}")
    public Cart getCartById(@PathVariable Long id) {
        return cartService.getCartById(id);
    }

    @DeleteMapping("{id}")
    public void deleteCart(@PathVariable Long id) {
        cartService.deleteCart(id);
    }
    

    //custom methods
    @GetMapping("/user/{userId}")
    public Cart getCartByUserId(@PathVariable Long userId) {
        return cartService.getCartByUserId(userId);
    }

    @PutMapping("/add/{userId}")
    public Cart addItemsToCart(@PathVariable Long userId, @RequestBody List<Long> groceryIds) {
        return cartService.addItemsToCart(userId, groceryIds);
    }

    @PutMapping("/empty/{userId}")
    public void emptyCart(@PathVariable Long userId) {
        cartService.emptyCart(userId);
    }

    @PostMapping("/order/{cartId}")
    public Orders placeOrderFromCart(@PathVariable Long cartId) {
        return cartService.placeOrderFromCart(cartId);
    }
    
    /**
     * OPTIMIZED: Place order from cart with single-fetch pattern
     * 
     * Returns lightweight DTO instead of full entity with nested objects.
     * Uses batch operations for adding items to inventory.
     */
    @PostMapping("/order/{cartId}/optimized")
    public ResponseEntity<OrderResponseDTO> placeOrderFromCartOptimized(@PathVariable Long cartId) {
        OrderResponseDTO order = cartService.placeOrderFromCartOptimized(cartId);
        if (order == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(order);
    }
}