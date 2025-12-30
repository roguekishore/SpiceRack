import { createContext, useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [inventory, setInventory] = useState(null);
  
  // Track pending operations for rollback capability
  const pendingOperations = useRef(new Map());
  
  // Track the latest expected quantity per grocery item to handle race conditions
  // Key: groceryId, Value: { expectedQuantity, pendingCount, lastOperationTime }
  const cartItemState = useRef(new Map());
  const inventoryItemState = useRef(new Map());

  const fetchOrders = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      setOrders([]);
    }
  }, []);

  const fetchCart = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/carts/user/${userId}`);
      if (response.ok) {
        const cartData = await response.json();
        setCart((prevCart) =>
          JSON.stringify(prevCart) !== JSON.stringify(cartData.cartGroceries)
            ? cartData.cartGroceries
            : prevCart
        );
        setUser(prevUser => {
          if (prevUser && cartData.id !== prevUser?.cart?.id) {
            return { ...prevUser, cart: cartData };
          }
          return prevUser;
        });
      }
    } catch (error) {
      setCart([]);
    }
  }, []);

  const fetchInventory = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/inventories/users/${userId}`);
      if (response.ok) {
        const inventoryData = await response.json();
        setInventory(inventoryData);
        setUser((prevUser) =>
          prevUser?.inventory?.id === inventoryData.id
            ? prevUser
            : { ...prevUser, inventory: inventoryData }
        );
      }
    } catch (error) {
      setInventory(null);
    }
  }, []);

  /**
   * OPTIMISTIC UI: Add product to cart
   * 
   * RACE CONDITION FIX:
   * - Track pending operations count per grocery item
   * - Only update from server when no pending operations remain
   * - This prevents stale server responses from overwriting optimistic state
   */
  const handleProductAdd = async (groceryId, groceryData = null) => {
    if (!user?.cart) return;
    
    const operationId = `add-${groceryId}-${Date.now()}`;
    
    // Initialize or update item state tracking
    const currentState = cartItemState.current.get(groceryId) || { pendingCount: 0, expectedQuantity: 0 };
    
    // Find current quantity in cart
    const currentItem = cart.find(item => item.grocery?.id === groceryId);
    const currentQuantity = currentItem?.quantity || 0;
    
    // Increment pending count and expected quantity
    currentState.pendingCount += 1;
    currentState.expectedQuantity = currentQuantity + 1;
    cartItemState.current.set(groceryId, currentState);
    
    // Store for rollback
    const previousCart = [...cart];
    pendingOperations.current.set(operationId, { previousCart, type: 'add', groceryId });
    
    // OPTIMISTIC UPDATE: Immediately update the UI
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        item => item.grocery?.id === groceryId
      );
      
      if (existingItemIndex >= 0) {
        // Item exists, increment quantity
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: (newCart[existingItemIndex].quantity || 0) + 1,
          _optimistic: true
        };
        return newCart;
      } else {
        // New item - create optimistic entry
        const optimisticItem = {
          id: `temp-${operationId}`,
          grocery: groceryData || { id: groceryId, name: 'Loading...', price: 0 },
          quantity: 1,
          _optimistic: true
        };
        return [...prevCart, optimisticItem];
      }
    });
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/carts/${user.cart.id}/items/add/${groceryId}/optimized`, 
        { method: "POST" }
      );
      
      if (response.ok) {
        const serverData = await response.json();
        
        // Decrement pending count
        const state = cartItemState.current.get(groceryId);
        if (state) {
          state.pendingCount -= 1;
          
          // Only update from server if no more pending operations
          // This prevents race conditions where older responses overwrite newer state
          if (state.pendingCount === 0) {
            setCart(prevCart => {
              return prevCart.map(item => {
                if (item.grocery?.id === groceryId) {
                  return {
                    id: serverData.id,
                    grocery: {
                      id: serverData.groceryId,
                      name: serverData.groceryName,
                      price: serverData.groceryPrice,
                      unit: serverData.groceryUnit,
                      category: serverData.groceryCategory,
                      type: serverData.groceryType,
                      imageUrl: serverData.groceryImageUrl
                    },
                    quantity: serverData.quantity,
                    _optimistic: false
                  };
                }
                return item;
              });
            });
            cartItemState.current.delete(groceryId);
          }
        }
        
        pendingOperations.current.delete(operationId);
      } else {
        throw new Error('Server request failed');
      }
    } catch (error) {
      console.error('Add to cart failed, rolling back:', error);
      
      // Decrement pending and rollback only this operation
      const state = cartItemState.current.get(groceryId);
      if (state) {
        state.pendingCount -= 1;
        state.expectedQuantity -= 1;
        
        // Rollback just this one increment
        setCart(prevCart => {
          return prevCart.map(item => {
            if (item.grocery?.id === groceryId) {
              const newQty = (item.quantity || 1) - 1;
              if (newQty <= 0) {
                return null; // Will be filtered
              }
              return { ...item, quantity: newQty };
            }
            return item;
          }).filter(Boolean);
        });
        
        if (state.pendingCount === 0) {
          cartItemState.current.delete(groceryId);
        }
      }
      
      pendingOperations.current.delete(operationId);
    }
  };

  /**
   * OPTIMISTIC UI: Delete product from cart
   */
  const handleProductDelete = async (groceryId) => {
    if (!user?.cart) return;
    
    const operationId = `delete-${groceryId}-${Date.now()}`;
    const previousCart = [...cart];
    
    // Clear any pending state for this item since we're deleting
    cartItemState.current.delete(groceryId);
    
    pendingOperations.current.set(operationId, { previousCart, type: 'delete' });
    
    // OPTIMISTIC UPDATE: Remove item immediately
    setCart(prevCart => prevCart.filter(item => item.grocery?.id !== groceryId));
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/carts/${user.cart.id}/items/remove/${groceryId}`,
        { method: "DELETE" }
      );
      
      if (!response.ok) {
        throw new Error('Delete failed');
      }
      
      pendingOperations.current.delete(operationId);
    } catch (error) {
      console.error('Delete from cart failed, rolling back:', error);
      setCart(previousCart);
      pendingOperations.current.delete(operationId);
    }
  };

  /**
   * OPTIMISTIC UI: Update product quantity
   * Uses pending count to handle rapid updates without race conditions
   */
  const handleUpdateQuantity = async (groceryId, quantity) => {
    if (!user?.cart) return;
    
    const roundedQty = Math.round(quantity * 10) / 10;
    
    if (roundedQty <= 0) {
      handleProductDelete(groceryId);
      return;
    }
    
    const operationId = `update-${groceryId}-${Date.now()}`;
    
    // Track this update operation
    const currentState = cartItemState.current.get(groceryId) || { pendingCount: 0, expectedQuantity: roundedQty };
    currentState.pendingCount += 1;
    currentState.expectedQuantity = roundedQty;
    cartItemState.current.set(groceryId, currentState);
    
    const previousCart = [...cart];
    pendingOperations.current.set(operationId, { previousCart, type: 'update', groceryId, quantity: roundedQty });
    
    // OPTIMISTIC UPDATE: Update quantity immediately
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.grocery?.id === groceryId) {
          return { ...item, quantity: roundedQty, _optimistic: true };
        }
        return item;
      });
    });
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/carts/${user.cart.id}/items/modify/${groceryId}/optimized?quantity=${roundedQty}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );
      
      if (response.ok) {
        const serverData = await response.json();
        
        const state = cartItemState.current.get(groceryId);
        if (state) {
          state.pendingCount -= 1;
          
          // Only sync with server when no pending operations
          if (state.pendingCount === 0) {
            setCart(prevCart => {
              return prevCart.map(item => {
                if (item.grocery?.id === groceryId) {
                  return {
                    ...item,
                    quantity: serverData.quantity,
                    _optimistic: false
                  };
                }
                return item;
              });
            });
            cartItemState.current.delete(groceryId);
          }
        }
        
        pendingOperations.current.delete(operationId);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Update quantity failed, rolling back:', error);
      
      const state = cartItemState.current.get(groceryId);
      if (state) {
        state.pendingCount -= 1;
        if (state.pendingCount === 0) {
          // Rollback to server state by refetching
          cartItemState.current.delete(groceryId);
          setCart(previousCart);
        }
      }
      pendingOperations.current.delete(operationId);
    }
  };

  const handleProductFavourite = async (groceryId) => {
    if (!user?.cart) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/carts/${user.cart.id}/items/${groceryId}/favorite`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        await fetchCart(user.id);
      }
    } catch (error) {
      // silently fail
    }
  };

  const handlePlaceOrder = async () => {
    if (!user?.cart?.id) return;
    
    // Store previous states for potential rollback
    const previousCart = [...cart];
    const previousInventory = inventory ? { ...inventory } : null;
    
    // OPTIMISTIC UPDATE: Clear cart immediately and show loading state
    setCart([]);
    
    try {
      // Use optimized endpoint for better performance
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/carts/order/${user.cart.id}/optimized`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.ok) {
        const orderData = await response.json();
        
        // Update orders with the new order
        setOrders(prevOrders => [orderData, ...prevOrders]);
        
        // Refresh inventory to show updated items
        await fetchInventory(user.id);
      } else {
        throw new Error('Order placement failed');
      }
    } catch (error) {
      // ROLLBACK on error
      console.error('Place order failed, rolling back:', error);
      setCart(previousCart);
      if (previousInventory) {
        setInventory(previousInventory);
      }
    }
  };

  /**
   * OPTIMISTIC UI: Update inventory quantity
   * Uses pending count to prevent race conditions with rapid updates
   */
  const handleInventoryQuantityUpdate = async (groceryId, quantity) => {
    if (!user?.inventory?.id) return;
    
    const roundedQty = Math.round(quantity * 10) / 10;
    const operationId = `inv-update-${groceryId}-${Date.now()}`;
    
    // Track pending state for this inventory item
    const currentState = inventoryItemState.current.get(groceryId) || { pendingCount: 0, expectedQuantity: roundedQty };
    currentState.pendingCount += 1;
    currentState.expectedQuantity = roundedQty;
    inventoryItemState.current.set(groceryId, currentState);
    
    const previousInventory = inventory ? { 
      ...inventory, 
      inventoryGroceries: [...(inventory.inventoryGroceries || [])] 
    } : null;
    pendingOperations.current.set(operationId, { previousInventory, type: 'inv-update', groceryId });
    
    // If quantity is 0 or less, remove the item
    if (roundedQty <= 0) {
      inventoryItemState.current.delete(groceryId);
      
      // OPTIMISTIC UPDATE: Remove item immediately
      setInventory(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          inventoryGroceries: prev.inventoryGroceries.filter(
            item => item.grocery?.id !== groceryId
          )
        };
      });
      
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/inventories/${user.inventory.id}/items/${groceryId}/optimized`,
          { method: "DELETE" }
        );
        
        if (!response.ok) {
          throw new Error('Delete failed');
        }
        
        pendingOperations.current.delete(operationId);
      } catch (error) {
        console.error('Inventory delete failed, rolling back:', error);
        if (previousInventory) {
          setInventory(previousInventory);
        }
        pendingOperations.current.delete(operationId);
      }
      return;
    }
    
    // OPTIMISTIC UPDATE: Update quantity immediately
    setInventory(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        inventoryGroceries: prev.inventoryGroceries.map(item => {
          if (item.grocery?.id === groceryId) {
            return { ...item, quantity: roundedQty, _optimistic: true };
          }
          return item;
        })
      };
    });
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/inventories/${user.inventory.id}/items/${groceryId}/optimized?quantity=${roundedQty}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );
      
      if (response.ok) {
        const serverData = await response.json();
        
        const state = inventoryItemState.current.get(groceryId);
        if (state) {
          state.pendingCount -= 1;
          
          // Only sync with server when no pending operations
          if (state.pendingCount === 0) {
            setInventory(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                inventoryGroceries: prev.inventoryGroceries.map(item => {
                  if (item.grocery?.id === groceryId) {
                    return {
                      ...item,
                      quantity: serverData.quantity,
                      _optimistic: false
                    };
                  }
                  return item;
                })
              };
            });
            inventoryItemState.current.delete(groceryId);
          }
        }
        
        pendingOperations.current.delete(operationId);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Inventory update failed, rolling back:', error);
      
      const state = inventoryItemState.current.get(groceryId);
      if (state) {
        state.pendingCount -= 1;
        if (state.pendingCount === 0) {
          if (previousInventory) {
            setInventory(previousInventory);
          }
          inventoryItemState.current.delete(groceryId);
        }
      }
      pendingOperations.current.delete(operationId);
    }
  };

  const updateUser = async (userData) => {
    if (!user?.id) throw new Error("User ID is missing");
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/users/${user.id}`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
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