import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { UserContext } from "../context/UserContext";
import { Package, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function InventoryDisplay() {
    const { user, fetchInventory, inventory, handleInventoryQuantityUpdate } = useContext(UserContext);
    const navigate = useNavigate();
    const [localQuantities, setLocalQuantities] = useState({});
    const quantityTimeouts = useRef({});

    const inventoryItems = inventory?.inventoryGroceries || [];

    useEffect(() => {
        if (user?.id) {
            fetchInventory(user.id);
        }
    }, [user?.id, fetchInventory]);

    const handleInputChange = (groceryId, value) => {
        if (value === '' || value === '-') {
            setLocalQuantities(prev => ({ ...prev, [groceryId]: '' }));
            return;
        }
        const newQuantity = parseFloat(value);
        if (!isNaN(newQuantity) && newQuantity >= 0) {
            const roundedQty = Math.round(newQuantity * 10) / 10;
            setLocalQuantities(prev => ({ ...prev, [groceryId]: roundedQty }));
            if (quantityTimeouts.current[groceryId]) {
                clearTimeout(quantityTimeouts.current[groceryId]);
            }
            quantityTimeouts.current[groceryId] = setTimeout(() => {
                handleInventoryQuantityUpdate(groceryId, roundedQty);
                setLocalQuantities(prev => {
                    const updated = { ...prev };
                    delete updated[groceryId];
                    return updated;
                });
            }, 300);
        }
    };

    const handleIncrement = (groceryId, currentQuantity) => {
        const newQty = Math.round((currentQuantity + 1) * 10) / 10;
        handleInventoryQuantityUpdate(groceryId, newQty);
    };

    const handleDecrement = (groceryId, currentQuantity) => {
        const newQty = Math.round((currentQuantity - 1) * 10) / 10;
        handleInventoryQuantityUpdate(groceryId, newQty > 0 ? newQty : 0);
    };

    const displayName = user?.name ? (user.name.charAt(0).toUpperCase() + user.name.slice(1)) : '';

    if (!user) {
        return (
            <div className="min-h-screen pt-20 pb-8">
                <div className="container mx-auto px-4 max-w-2xl">
                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <CardTitle>Inventory</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">Please login to view your inventory.</p>
                            <Button onClick={() => navigate('/login')}>
                                Login / Sign Up
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                        {displayName ? `${displayName}'s Inventory` : "Inventory"}
                    </h1>
                    <p className="text-muted-foreground">{inventoryItems.length} items in your pantry</p>
                </div>

                {inventoryItems.length === 0 ? (
                    <Card className="max-w-2xl mx-auto text-center">
                        <CardContent className="py-12">
                            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Your inventory is empty</h3>
                            <p className="text-muted-foreground mb-4">Place an order to add items to your inventory!</p>
                            <Button onClick={() => navigate('/products')}>
                                Browse Products
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {inventoryItems.map((item) => (
                            <Card key={item.grocery.id}>
                                <CardContent className="p-4">
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0">
                                            <img
                                                src={item.grocery.imageUrl}
                                                alt={item.grocery.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold capitalize truncate">{item.grocery.name}</h3>
                                            <p className="text-sm text-muted-foreground capitalize">{item.grocery.category}</p>
                                            <p className="text-sm text-muted-foreground">{item.grocery.unit}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 mt-4">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleDecrement(item.grocery.id, item.quantity)}
                                            disabled={item.quantity <= 0}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <Input
                                            type="number"
                                            value={localQuantities[item.grocery.id] !== undefined ? localQuantities[item.grocery.id] : item.quantity}
                                            onChange={(e) => handleInputChange(item.grocery.id, e.target.value)}
                                            className="w-20 text-center"
                                            min="0"
                                            step="0.1"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleIncrement(item.grocery.id, item.quantity)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}