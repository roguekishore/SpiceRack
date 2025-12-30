package com.example.springapp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.springapp.entities.Grocery;
import com.example.springapp.entities.Orders;
import com.example.springapp.services.OrderService;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/{userId}")
    public Orders createOrder(@PathVariable Long userId, @RequestBody List<Grocery> groceries) {
        return orderService.createOrder(userId, groceries);
    }

    @GetMapping
    public List<Orders> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/{id}")
    public Orders getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }
    
    @PutMapping("/{id}")
    public Orders updateOrder(@PathVariable Long id, @RequestBody Orders sampleOrder) {
        return orderService.updateOrder(id, sampleOrder);
    }
    
    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
    }
    
    // custom methods
    @PostMapping("/add/{userId}")
    public Orders createUserOrder(@PathVariable Long userId, @RequestBody List<Long> groceryIds) {
        return orderService.createUserOrder(userId, groceryIds);
    }

    @GetMapping("/user/{userId}")
    public List<Orders> getOrderByUserId(@PathVariable Long userId) {
        return orderService.getOrdersByUserId(userId);
    }

    @PutMapping("/change/{orderId}")
    public Orders updateOrder(@PathVariable Long orderId, @RequestBody List<Long> groceryIds) {
        return orderService.updateUserOrder(orderId, groceryIds);
    }
}