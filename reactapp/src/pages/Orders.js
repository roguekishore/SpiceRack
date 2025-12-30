import { useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import LogoutButton from "./Logout";
import "../css/Orders.css";

const Orders = () => {
  const { user, orders, fetchOrders } = useContext(UserContext);

  useEffect(() => {
    if (user?.id) {
      fetchOrders(user.id);
    }
  }, [user?.id, fetchOrders]);
  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>Your Orders</h2>
      </div>

      {orders.length > 0 ? (
        <div className="orders-list">
          {orders.map((order, index) => (
            <div key={order.id} className="order-card">
              <div className="order-summary">
                <div className="order-info">
                  <h3>Order #{index + 1}</h3>
                  <p className="order-date">{new Date(order.date).toLocaleString()}</p>
                </div>
                <div className="order-total">
                  <p>Total: <span className="price">${order.totalPrice}</span></p>
                </div>
              </div>
              
              <div className="order-items">
                {order.orderGroceries && order.orderGroceries.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="item-image">
                      <img
                        src={item.grocery.imageUrl}
                        alt={item.grocery.name}
                      />
                    </div>
                    <div className="item-details">
                      <h4>{item.grocery.name.charAt(0).toUpperCase() + item.grocery.name.slice(1)}</h4>
                      <div className="item-pricing">
                        <span className="item-price">${item.grocery.price.toFixed(2)}</span>
                        <span className="item-quantity">Qty: {item.quantity} {item.grocery.unit}</span>
                        <span className="item-subtotal">${(item.grocery.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <a href="/products" className="shop-now-button">Shop Now</a>
        </div>
      )}
    </div>
  );
};

export default Orders;