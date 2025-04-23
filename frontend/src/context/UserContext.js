import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [inventory, setInventory] = useState(null); 

  const fetchOrders = useCallback(async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/user/${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    }
  }, []);

  const fetchCart = async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/carts/user/${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.status}`);
      }
      const cartData = await response.json();
      //console.log("Fetched Cart:", cartData);
      setCart((prevCart) =>
        JSON.stringify(prevCart) !== JSON.stringify(cartData.cartGroceries)
          ? cartData.cartGroceries
          : prevCart
      );
      if (cartData.id !== user?.cart?.id) {
        setUser(prevUser => ({ ...prevUser, cart: cartData }));
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart([]);
    }
  };

  const fetchInventory = async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/inventories/users/${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch inventory: ${response.status}`);
      }
      const inventoryData = await response.json();
      setInventory(inventoryData);
      setUser((prevUser) =>
        prevUser?.inventory?.id === inventoryData.id
          ? prevUser
          : { ...prevUser, inventory: inventoryData }
      );
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setInventory(null);
    }
  };

  const handleProductAdd = async (groceryId) => {
    if (!user?.cart) {
      console.error("No user or cart found!");
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/carts/${user.cart.id}/items/add/${groceryId}`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`Failed to add product: ${response.status}`);
      }
      console.log("Product added successfully!");
      await fetchCart(user.id);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleProductDelete = async (groceryId) => {
    if (!user?.cart) {
      console.error("User or cart is missing");
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/carts/${user.cart.id}/items/remove/${groceryId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        console.log("Product deleted successfully");
        setTimeout(() => fetchCart(user.id), 200);
      } else {
        console.error(`Failed to delete product: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleUpdateQuantity = async (groceryId, quantity) => {
    if (!user?.cart) {
      console.error("User or cart is missing");
      return;
    }
    if (quantity < 0.1) {
      if (quantity === 0) {
        handleProductDelete(groceryId);
        return;
      }
      console.log("Quantity must be at least 0.1"); // Or handle this error as needed
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/carts/${user.cart.id}/items/modify/${groceryId}?quantity=${quantity}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.ok) {
        console.log("Quantity updated successfully!");
        fetchCart(user.id);
      } else {
        console.error(`Failed to update quantity: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleProductFavourite = async (groceryId) => {
    if (!user?.cart) {
      console.error("User or cart is missing");
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/carts/${user.cart.id}/items/${groceryId}/favorite`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        fetchCart(user.id);
      } else {
        console.error(`Failed to toggle favourite: ${response.status}`);
      }
    } catch (error) {
      console.error("Error toggling favourite:", error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user?.cart?.id) {
      console.error("User or cart information is missing.");
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/carts/order/${user.cart.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        console.log("Order placed successfully!");
        fetchCart(user.id);
      } else {
        console.error(`Failed to place order: ${response.status}`);
        const errorData = await response.json();
        console.error("Error details:", errorData);
      }
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  const handleInventoryQuantityUpdate = async (groceryId, quantity) => {
    if (!user?.inventory?.id) {
      console.error("User or inventory is missing");
      return;
    }
    if (quantity === 0) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/inventories/${user.inventory.id}/items/${groceryId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          console.log("Item removed from inventory successfully");
          fetchInventory(user.id);
        } else {
          console.error(`Failed to remove item: ${response.status}`);
        }
      } catch (error) {
        console.error("Error removing item:", error);
      }
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/inventories/${user.inventory.id}/items/${groceryId}?quantity=${quantity}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.ok) {
        console.log("Inventory quantity updated successfully!");
        fetchInventory(user.id);
      } else {
        console.error(`Failed to update inventory quantity: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating inventory quantity:", error);
    }
  };

  const updateUser = async (userData) => {
    try {
      if (!user?.id) {
        console.error("User ID is missing, cannot update.");
        throw new Error("User ID is missing");
      }
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/users/${user.id}`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      // console.log("User found in storage:", user);
      fetchOrders(user.id);
      fetchCart(user.id);
      fetchInventory(user.id);
    } else {
      localStorage.removeItem("user");
      setInventory(null);
    }
  }, [user?.id]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        orders,
        fetchOrders,
        cart,
        fetchCart,
        handleProductAdd,
        handleProductDelete,
        handleUpdateQuantity,
        handleProductFavourite,
        handlePlaceOrder,
        inventory,
        fetchInventory,
        handleInventoryQuantityUpdate,
        updateUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
};