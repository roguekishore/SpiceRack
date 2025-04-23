package com.example.springapp.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.springapp.entities.User;
import com.example.springapp.repositories.UserRepository;
import com.example.springapp.services.CartService;

import jakarta.persistence.EntityNotFoundException;

@Service
public class UserService{

    private final UserRepository userRepository;
    private final CartService cartService;
    private final InventoryService inventoryService;

    @Autowired
    public UserService(UserRepository userRepository,
                           CartService cartService,
                           InventoryService inventoryService) {
        this.userRepository = userRepository;
        this.cartService = cartService;
        this.inventoryService = inventoryService;
    }

    public User createUser(User user) {
        User savedUser = userRepository.save(user);
        cartService.createCart(savedUser.getId());
        inventoryService.createInventory(savedUser.getId());
        return savedUser;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(long userId) {
        return userRepository.findById(userId).orElseThrow(EntityNotFoundException::new);
    }

    public User updateUser(long userId, User user) {
        User existingUser = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found with ID"));
        existingUser.setName(user.getName());
        existingUser.setEmail(user.getEmail());
        existingUser.setPassword(user.getPassword());
        return userRepository.save(existingUser);
    }

    public void deleteUser(long userId) {
        userRepository.deleteById(userId);
    }
}