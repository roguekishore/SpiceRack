import { Link } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { UserContext } from "../context/UserContext";
import '../css/Inventory.css'

export default function InventoryDisplay() {
    const { user, fetchInventory, inventory, handleInventoryQuantityUpdate } = useContext(UserContext);
    const [localQuantities, setLocalQuantities] = useState({});
    const quantityTimeouts = useRef({});

    // Use inventory items directly from context for optimistic updates
    const inventoryItems = inventory?.inventoryGroceries || [];

    // Ensure inventory is fetched when the page mounts or when the user logs in
    useEffect(() => {
        if (user?.id) {
            fetchInventory(user.id);
        }
    }, [user?.id, fetchInventory]);

    const handleInputChange = (groceryId, value) => {
        // Allow empty input for user to type
        if (value === '' || value === '-') {
            setLocalQuantities(prev => ({ ...prev, [groceryId]: '' }));
            return;
        }
        const newQuantity = parseFloat(value);
        if (!isNaN(newQuantity) && newQuantity >= 0) {
            // Round to 1 decimal place
            const roundedQty = Math.round(newQuantity * 10) / 10;
            setLocalQuantities(prev => ({ ...prev, [groceryId]: roundedQty }));
            // Clear any existing timeout
            if (quantityTimeouts.current[groceryId]) {
                clearTimeout(quantityTimeouts.current[groceryId]);
            }
            // Debounce the API call - use optimized handler from context
            quantityTimeouts.current[groceryId] = setTimeout(() => {
                handleInventoryQuantityUpdate(groceryId, roundedQty);
                setLocalQuantities(prev => {
                    const updated = { ...prev };
                    delete updated[groceryId];
                    return updated;
                });
            }, 300); // Reduced debounce for faster feel
        }
    };

    const handleInputBlur = (groceryId, currentQuantity) => {
        const val = localQuantities[groceryId];
        if (val === '' || isNaN(parseFloat(val))) {
            setLocalQuantities(prev => {
                const updated = { ...prev };
                delete updated[groceryId];
                return updated;
            });
        }
    };

    const handleIncrement = (groceryId, currentQuantity) => {
        const newQty = Math.round((currentQuantity + 1) * 10) / 10;
        // Use optimized handler from context - instant optimistic update
        handleInventoryQuantityUpdate(groceryId, newQty);
    };

    const handleDecrement = (groceryId, currentQuantity) => {
        const newQty = Math.round((currentQuantity - 1) * 10) / 10;
        // Use optimized handler from context
        handleInventoryQuantityUpdate(groceryId, newQty > 0 ? newQty : 0);
    };

    const displayName = user?.name ? (user.name.charAt(0).toUpperCase() + user.name.slice(1)) : '';

    return (
        <div className="inventory-container">
            <div className="inventory-name">
                <h1 className="inventory-heading">{displayName ? `${displayName}'s Inventory` : "Inventory"}</h1>
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
                                                value={localQuantities[item.grocery.id] !== undefined ? localQuantities[item.grocery.id] : item.quantity}
                                                onChange={(e) => handleInputChange(item.grocery.id, e.target.value)}
                                                onBlur={() => handleInputBlur(item.grocery.id, item.quantity)}
                                                className="product-quantity-input"
                                                min="0"
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