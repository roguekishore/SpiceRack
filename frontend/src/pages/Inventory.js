import { Link } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import '../css/Inventory.css'

export default function InventoryDisplay() {
    const { user, handleUpdateQuantity, fetchInventory, inventory } = useContext(UserContext);
    const [inventoryItems, setInventoryItems] = useState([]);

    useEffect(() => {
        if (inventory && inventory.inventoryGroceries) {
            setInventoryItems(inventory.inventoryGroceries);
        } else {
            setInventoryItems([]);
        }
    }, [inventory]);

    useEffect(() => {
        if (inventory && inventory.inventoryGroceries) {
            setInventoryItems(inventory.inventoryGroceries);
        } else {
            setInventoryItems([]);
        }
    }, [inventory]);

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

    const handleInputChange = (groceryId, value) => {
        const item = inventoryItems.find(item => item.grocery.id === groceryId);
        if (item) {
            const newQuantity = parseFloat(value);
            if (!isNaN(newQuantity) && newQuantity >= 0) {
                handleInventoryQuantityUpdate(groceryId, newQuantity);
            }
        }
    };

    const handleIncrement = (groceryId, currentQuantity) => {
        handleInventoryQuantityUpdate(groceryId, parseFloat((currentQuantity + 0.1).toFixed(1)));
    };

    const handleDecrement = (groceryId, currentQuantity) => {
        if (currentQuantity > 0) {
            handleInventoryQuantityUpdate(groceryId, parseFloat((currentQuantity - 0.1).toFixed(1)));
        }
    };

    return (
        <div className="inventory-container">
            <div className="inventory-name">
                <h1 className="inventory-heading">{user.name.charAt(0).toUpperCase() + user.name.slice(1)}'s Inventory</h1>
            </div>
            <div className="inventory-product-container">
                <div className="product">
                    <div className="products-content">
                        {inventoryItems.map((item) => (
                            <div key={item.grocery.id} className="product-content">
                                <div className="product-content-image">
                                    <Link to={`${item.grocery.imageUrl}`} className="product-link">
                                        <img
                                            src={item.grocery.imageUrl}
                                            width="128"
                                            height="128"
                                            className="product-image"
                                            alt={item.grocery.name}
                                        />
                                    </Link>
                                </div>
                                <div className="product-info">
                                    <h3>{item.grocery.name.charAt(0).toUpperCase() + item.grocery.name.slice(1)}</h3>
                                    <p>{item.grocery.category.charAt(0).toUpperCase() + item.grocery.category.slice(1)}</p>
                                </div>
                                <div className="product-price">
                                    <div className="product-btns">
                                        <>
                                            <button
                                                type="button"
                                                className="product-btn-add"
                                                onClick={() => handleDecrement(item.grocery.id, item.quantity)}
                                                disabled={item.quantity <= 0}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24">
                                                    <path d="M3.997 13H20a1 1 0 1 0 0-2H3.997a1 1 0 1 0 0 2Z" fill="white" />
                                                </svg>
                                            </button>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleInputChange(item.grocery.id, e.target.value)}
                                                className="product-quantity-input"
                                                step="0.1"
                                            />
                                            <button
                                                type="button"
                                                className="product-btn-add"
                                                onClick={() => handleIncrement(item.grocery.id, item.quantity)}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24">
                                                    <path d="M11.883 3.007 12 3a1 1 0 0 1 .993.883L13 4v7h7a1 1 0 0 1 .993.883L21 12a1 1 0 0 1-.883.993L20 13h-7v7a1 1 0 0 1-.883.993L12 21a1 1 0 0 1-.993-.883L11 20v-7H4a1 1 0 0 1-.993-.883L3 12a1 1 0 0 1 .883-.993L4 11h7V4a1 1 0 0 1 .883-.993L12 3l-.117.007Z" fill="white" />
                                                </svg>
                                            </button>
                                        </>
                                    </div>
                                    <h3>
                                        <span>{item.grocery.unit}</span>
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}