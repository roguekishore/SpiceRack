package com.example.springapp.services;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.springapp.entities.Cart;
import com.example.springapp.entities.CartGrocery;
import com.example.springapp.entities.Grocery;
import com.example.springapp.repositories.CartGroceryRepository;
import com.example.springapp.repositories.CartRepository;
import com.example.springapp.repositories.GroceryRepository;

import java.util.List;
import java.util.Optional;

@Service
public class CartGroceryService {

    private final CartGroceryRepository cartGroceryRepository;
    private final CartRepository cartRepository;
    private final GroceryRepository groceryRepository;

    @Autowired
    public CartGroceryService(CartGroceryRepository cartGroceryRepository, CartRepository cartRepository, GroceryRepository groceryRepository) {
        this.cartGroceryRepository = cartGroceryRepository;
        this.cartRepository = cartRepository;
        this.groceryRepository = groceryRepository;
    }

    public CartGrocery addGroceryToCart(Long cartId, Long groceryId) {
        Cart cart = cartRepository.findById(cartId).orElseThrow(() -> new RuntimeException("Cart not found"));
        Grocery grocery = groceryRepository.findById(groceryId).orElseThrow(() -> new RuntimeException("Grocery not found"));

        Optional<CartGrocery> existingItem = cartGroceryRepository.findByCartIdAndGroceryId(cartId, groceryId);

        if (existingItem.isPresent()) {
            CartGrocery cartGrocery = existingItem.get();
            cartGrocery.setQuantity(cartGrocery.getQuantity() + 1);
            return cartGroceryRepository.save(cartGrocery);
        } else {
            CartGrocery cartGrocery = new CartGrocery();
            cartGrocery.setCart(cart);
            cartGrocery.setGrocery(grocery);
            cartGrocery.setQuantity(1.0);
            return cartGroceryRepository.save(cartGrocery);
        }
    }

    public List<CartGrocery> getCartItemsByCartId(Long cartId) {
        return cartGroceryRepository.findByCartId(cartId);
    }


    public CartGrocery updateCartItemQuantity(Long cartId, Long groceryId, Double quantity) {
        CartGrocery cartGrocery = cartGroceryRepository.findByCartIdAndGroceryId(cartId, groceryId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        cartGrocery.setQuantity(quantity);
        return cartGroceryRepository.save(cartGrocery);
    }

    @Transactional
    public void removeGroceryFromCart(Long cartId, Long groceryId) {
        cartGroceryRepository.deleteByCartIdAndGroceryId(cartId, groceryId);
    }
}