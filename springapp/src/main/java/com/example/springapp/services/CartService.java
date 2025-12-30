package com.example.springapp.services;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.springapp.dto.OrderItemDTO;
import com.example.springapp.dto.OrderResponseDTO;
import com.example.springapp.entities.Cart;
import com.example.springapp.entities.CartGrocery;
import com.example.springapp.entities.Grocery;
import com.example.springapp.entities.Inventory;
import com.example.springapp.entities.InventoryGrocery;
import com.example.springapp.entities.OrderGrocery;
import com.example.springapp.entities.Orders;
import com.example.springapp.entities.User;
import com.example.springapp.repositories.CartGroceryRepository;
import com.example.springapp.repositories.CartRepository;
import com.example.springapp.repositories.GroceryRepository;
import com.example.springapp.repositories.InventoryGroceryRepository;
import com.example.springapp.repositories.InventoryRepository;
import com.example.springapp.repositories.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final CartGroceryRepository cartGroceryRepository;
    private final GroceryRepository groceryRespository;
    private final OrderService orderService;
    private final InventoryRepository inventoryRepository;
    private final InventoryService inventoryService;
    private final InventoryGroceryRepository inventoryGroceryRepository;

    @Autowired
    public CartService(CartRepository cartRepository,
            UserRepository userRepository,
            CartGroceryRepository cartGroceryRepository,
            GroceryRepository groceryRespository,
            OrderService orderService,
            InventoryRepository inventoryRepository,
            InventoryService inventoryService,
            InventoryGroceryRepository inventoryGroceryRepository) {
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.cartGroceryRepository = cartGroceryRepository;
        this.groceryRespository = groceryRespository;
        this.orderService = orderService;
        this.inventoryRepository = inventoryRepository;
        this.inventoryService = inventoryService;
        this.inventoryGroceryRepository = inventoryGroceryRepository;
    }

    public Cart createCart(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("USER NOT FOUND"));
        Cart cart = new Cart();
        cart.setUser(user);
        return cartRepository.save(cart);
    }

    public Cart getCartById(Long cartId) {
        return cartRepository.findById(cartId).orElseThrow(EntityNotFoundException::new);
    }

    public void deleteCart(long id) {
        cartRepository.delete(getCartById(id));
    }

    // custom methods
    public Cart getCartByUserId(Long userId) {
        return cartRepository.findByUserId(userId);
    }

    public Cart addItemsToCart(Long userId, List<Long> groceryIds) {
        Cart existingCart = cartRepository.findById(userId).orElseThrow(EntityNotFoundException::new);
        List<Grocery> groceries = groceryRespository.findAllById(groceryIds);
        //existingCart.setGroceries(groceries);
        return cartRepository.save(existingCart);
    }

    public void emptyCart(Long cartId) {
        List<CartGrocery> cartGroceries = cartGroceryRepository.findByCartId(cartId);
        cartGroceryRepository.deleteAll(cartGroceries);
    }

    public Orders placeOrderFromCart(Long cartId) {
        List<CartGrocery> cartGroceries = cartGroceryRepository.findByCartId(cartId);
        if (cartGroceries.isEmpty()) {
            return null;
        }

        Cart cart = cartGroceries.get(0).getCart();
        User user = cart.getUser();
        if (user == null) {
            return null;
        }

        Orders order = new Orders();
        order.setDate(new Date());
        order.setUser(user);
        order.setOrderGroceries(new ArrayList<>());

        Double totalPrice = 0.0;
        for (CartGrocery cartGrocery : cartGroceries) {
            Grocery grocery = cartGrocery.getGrocery();
            OrderGrocery orderItem = new OrderGrocery();
            orderItem.setOrder(order);
            orderItem.setGrocery(grocery);
            orderItem.setQuantity(cartGrocery.getQuantity());
            order.getOrderGroceries().add(orderItem);
            totalPrice += grocery.getPrice() * cartGrocery.getQuantity();

        }
        order.setTotalPrice(totalPrice);

        // adding items to invetory
        addCartItemsToInventory(cartId, user);
        emptyCart(cart.getId());

        return orderService.saveOrder(order);
    }

    /**
     * OPTIMIZED: Place order from cart using single-fetch pattern
     * 
     * Previous implementation: Multiple sequential queries
     * - 1 query to get cart groceries
     * - 1 query to get cart
     * - 1 query to get user
     * - N queries in loop for order items
     * - 1 query to get inventory
     * - N queries in loop for inventory items
     * - N queries to save inventory items
     * - 1 query to delete cart items
     * - 1 query to save order
     * 
     * New implementation: Minimized queries using JOIN FETCH and batch operations
     */
    @Transactional
    public OrderResponseDTO placeOrderFromCartOptimized(Long cartId) {
        // Single query: Fetch cart with all items and groceries
        Cart cart = cartRepository.findByIdWithAllData(cartId)
            .orElseThrow(() -> new RuntimeException("Cart not found"));
        
        List<CartGrocery> cartGroceries = cart.getCartGroceries();
        if (cartGroceries == null || cartGroceries.isEmpty()) {
            return null;
        }

        User user = cart.getUser();
        if (user == null) {
            return null;
        }

        // Create order with items
        Orders order = new Orders();
        order.setDate(new Date());
        order.setUser(user);
        order.setOrderGroceries(new ArrayList<>());

        Double totalPrice = 0.0;
        for (CartGrocery cartGrocery : cartGroceries) {
            Grocery grocery = cartGrocery.getGrocery();
            OrderGrocery orderItem = new OrderGrocery();
            orderItem.setOrder(order);
            orderItem.setGrocery(grocery);
            orderItem.setQuantity(cartGrocery.getQuantity());
            order.getOrderGroceries().add(orderItem);
            totalPrice += grocery.getPrice() * cartGrocery.getQuantity();
        }
        order.setTotalPrice(totalPrice);

        // Add items to inventory - optimized
        addCartItemsToInventoryOptimized(cart, user);
        
        // Empty cart - already have items loaded
        cartGroceryRepository.deleteAll(cartGroceries);

        // Save order
        Orders savedOrder = orderService.saveOrder(order);
        
        return mapOrderToDTO(savedOrder);
    }

    /**
     * OPTIMIZED: Add cart items to inventory with batch operations
     */
    private void addCartItemsToInventoryOptimized(Cart cart, User user) {
        // Single query: Get inventory with all items
        Inventory inventory = inventoryRepository.findByUserId(user.getId());
        if (inventory == null) {
            inventory = inventoryService.createInventory(user.getId());
            inventory.setInventoryGroceries(new ArrayList<>());
        }

        List<CartGrocery> cartGroceries = cart.getCartGroceries();
        
        // Build a map of existing inventory items for O(1) lookup
        Map<Long, InventoryGrocery> existingItemsMap = inventory.getInventoryGroceries().stream()
            .collect(Collectors.toMap(
                ig -> ig.getGrocery().getId(), 
                Function.identity(),
                (existing, replacement) -> existing
            ));

        List<InventoryGrocery> itemsToSave = new ArrayList<>();
        
        for (CartGrocery cartGrocery : cartGroceries) {
            Grocery grocery = cartGrocery.getGrocery();
            Double quantity = cartGrocery.getQuantity();

            InventoryGrocery existingInventoryGrocery = existingItemsMap.get(grocery.getId());

            if (existingInventoryGrocery != null) {
                existingInventoryGrocery.setQuantity(existingInventoryGrocery.getQuantity() + quantity);
                itemsToSave.add(existingInventoryGrocery);
            } else {
                InventoryGrocery inventoryGrocery = new InventoryGrocery();
                inventoryGrocery.setInventory(inventory);
                inventoryGrocery.setGrocery(grocery);
                inventoryGrocery.setQuantity(quantity);
                itemsToSave.add(inventoryGrocery);
            }
        }
        
        // Batch save all inventory items at once
        inventoryGroceryRepository.saveAll(itemsToSave);
    }

    private void addCartItemsToInventory(Long cartId, User user) {

        Inventory inventory = inventoryService.getInventoryByUserId(user.getId());
        if (inventory == null) {
            inventory = inventoryService.createInventory(user.getId());
        }

        List<CartGrocery> cartGroceries = cartGroceryRepository.findByCartId(cartId);
        for (CartGrocery cartGrocery : cartGroceries) {
            Grocery grocery = cartGrocery.getGrocery();
            Double quantity = cartGrocery.getQuantity();

            InventoryGrocery existingInventoryGrocery = inventoryGroceryRepository
                    .findByInventoryIdAndGroceryId(inventory.getId(), grocery.getId()).orElse(null);

            if (existingInventoryGrocery != null) {
                existingInventoryGrocery.setQuantity(existingInventoryGrocery.getQuantity() + quantity);
                inventoryGroceryRepository.save(existingInventoryGrocery);
            } else {
                InventoryGrocery inventoryGrocery = new InventoryGrocery();
                inventoryGrocery.setInventory(inventory);
                inventoryGrocery.setGrocery(grocery);
                inventoryGrocery.setQuantity(quantity);
                inventoryGroceryRepository.save(inventoryGrocery);
            }
        }
    }
    
    // ============= DTO Mapping Helpers =============
    
    private OrderResponseDTO mapOrderToDTO(Orders order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUser() != null ? order.getUser().getId() : null);
        dto.setDate(order.getDate());
        dto.setTotalPrice(order.getTotalPrice());
        
        List<OrderItemDTO> items = new ArrayList<>();
        if (order.getOrderGroceries() != null) {
            items = order.getOrderGroceries().stream()
                .map(this::mapOrderItemToDTO)
                .collect(Collectors.toList());
        }
        dto.setItems(items);
        
        return dto;
    }
    
    private OrderItemDTO mapOrderItemToDTO(OrderGrocery og) {
        Grocery g = og.getGrocery();
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(og.getId());
        dto.setGroceryId(g.getId());
        dto.setGroceryName(g.getName());
        dto.setGroceryPrice(g.getPrice());
        dto.setGroceryUnit(g.getUnit());
        dto.setGroceryCategory(g.getCategory());
        dto.setGroceryImageUrl(g.getImageUrl());
        dto.setQuantity(og.getQuantity());
        return dto;
    }
}
