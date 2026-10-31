import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { cn } from '../lib/utils';

export default function Cart() {
  const { user, cart, handlePlaceOrder, handleUpdateQuantity, handleProductDelete } = useContext(UserContext);
  const navigate = useNavigate();
  const [notificationMessage, setNotificationMessage] = useState("");

  const cartItems = cart || [];
  const totalProducts = cart.length;

  const totalPrice = cartItems.reduce(
    (total, item) =>
      total + Number.parseFloat(item.grocery?.price || 0) * (item.quantity || 0),
    0
  );

  const handleCheckout = async (e) => {
    e.preventDefault();
    await handlePlaceOrder();
    setNotificationMessage("Order placed successfully!");
    setTimeout(() => {
      navigate('/inventory');
    }, 1500);
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle>Your Cart</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">Please login to view your cart and add items.</p>
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">{totalProducts} {totalProducts === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        {cartItems.length === 0 ? (
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-4">Start adding products to your cart!</p>
              <Button onClick={() => navigate('/products')}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems
                .filter((item) => (item.quantity || 0) > 0)
                .map((item) => (
                  <Card key={item.grocery?.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-md overflow-hidden bg-muted shrink-0">
                          <img
                            src={item.grocery?.imageUrl}
                            alt={item.grocery?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold capitalize truncate">{item.grocery?.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{item.grocery?.category}</p>
                          <p className="font-bold mt-1">
                            ${item.grocery?.price}
                            <span className="text-sm font-normal text-muted-foreground"> / {item.grocery?.unit}</span>
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                const newQty = item.quantity - 1;
                                if (newQty <= 0) {
                                  handleProductDelete(item.grocery?.id);
                                } else {
                                  handleUpdateQuantity(item.grocery?.id, newQty);
                                }
                              }}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.grocery?.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleProductDelete(item.grocery?.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxes</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" size="lg" onClick={handleCheckout}>
                    Place Order
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}

        {/* Success Notification */}
        {notificationMessage && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
            {notificationMessage}
          </div>
        )}
      </div>
    </div>
  );
}
