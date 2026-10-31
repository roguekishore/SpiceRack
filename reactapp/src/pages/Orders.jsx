import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { Package, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

const Orders = () => {
  const { user, orders, fetchOrders } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchOrders(user.id);
    }
  }, [user?.id, fetchOrders]);

  if (!user) {
    return (
      <div className="min-h-screen pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle>Your Orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">Please login to view your orders.</p>
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">Your Orders</h1>
          <p className="text-muted-foreground">{orders.length} {orders.length === 1 ? 'order' : 'orders'} placed</p>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <Card key={order.id}>
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">Order #{index + 1}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(order.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">Completed</Badge>
                      <span className="font-bold text-lg">${order.totalPrice?.toFixed(2)}</span>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {order.orderGroceries && order.orderGroceries.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                          <img
                            src={item.grocery.imageUrl}
                            alt={item.grocery.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium capitalize truncate">{item.grocery.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ${item.grocery.price?.toFixed(2)} × {item.quantity} {item.grocery.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">${(item.grocery.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
              <Button onClick={() => navigate('/products')}>
                Shop Now
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Orders;