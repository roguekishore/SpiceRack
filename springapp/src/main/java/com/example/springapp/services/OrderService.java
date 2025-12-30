package com.example.springapp.services;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.springapp.entities.Grocery;
import com.example.springapp.entities.Orders;
import com.example.springapp.entities.User;
import com.example.springapp.repositories.GroceryRepository;
import com.example.springapp.repositories.OrderRepository;
import com.example.springapp.repositories.UserRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class OrderService {

    @Autowired
    private GroceryRepository groceryRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    public Orders createOrder(Long userId, List<Grocery> groceries) {
        User existingUser = userRepository.findById(userId).orElseThrow(EntityNotFoundException::new);
        Orders newOrder = new Orders();
        for (Grocery grocery : groceries) {
            if (grocery.getId() == null) {
                groceryRepository.save(grocery);
            }
        }
        newOrder.setUser(existingUser);
        newOrder.setDate(new Date());
        return orderRepository.save(newOrder);
    }

    public List<Orders> getAllOrders() {
        return orderRepository.findAll();
    }

    public Orders getOrderById(Long id) {
        return orderRepository.findById(id).orElseThrow(EntityNotFoundException::new);
    }

    public Orders updateOrder(Long id, Orders sampleOrder) {
        Orders existingOrder = orderRepository.findById(id).orElseThrow(EntityNotFoundException::new);
        existingOrder.setDate(sampleOrder.getDate());
        return orderRepository.save(existingOrder);
    }
    
    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
    
    //custom methods
    public Orders createUserOrder(Long userId, List<Long> groceryIds) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        User user = userOptional.get();
        
        List<Grocery> groceries = groceryRepository.findAllById(groceryIds);
        if (groceries.isEmpty()) {
            throw new RuntimeException("No valid grocery items found");
        }
        Double totalPrice = groceries.stream()
        .mapToDouble(Grocery::getPrice)
        .sum();
        Orders order = new Orders();
        order.setUser(user);
        order.setDate(new Date());
        order.setTotalPrice(totalPrice);
        return orderRepository.save(order);
    }
    
    public List<Orders> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
        
    }

    public Orders updateUserOrder(Long orderId, List<Long> groceryIds) {
        Orders order = orderRepository.findById(orderId)
        .orElseThrow(() -> new RuntimeException("Order not found"));
        List<Grocery> groceries = groceryRepository.findAllById(groceryIds);
        return orderRepository.save(order);
    }

    public Orders saveOrder(Orders order) {
        return orderRepository.save(order);
    }
}