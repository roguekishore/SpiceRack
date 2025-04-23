package com.example.springapp.services;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}
