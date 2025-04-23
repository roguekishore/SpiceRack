import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext"; // Make sure path is correct
import ProductInfo from './ProductInfo';
import Notification from './Notification'; // Adjust the path if needed
import '../css/Cart.css';
import '../css/Notification.css'; // Import notification styles

export default function Cart() {
  const {
    cart,
    handleProductAdd,
    handleProductDelete,
    handleProductFavourite,
    handlePlaceOrder
  } = useContext(UserContext);

  const [notificationMessage, setNotificationMessage] = useState("");

  const cartItems = cart || [];
  const totalProducts = cart.length;

  const totalPrice = cartItems.reduce(
    (total, item) =>
      total + Number.parseFloat(item.grocery?.price || 0) * (item.quantity || 0),
    0
  );

  const totalQuantity = cartItems.reduce(
    (total, item) => total + Number.parseInt(item.quantity || 0),
    0
  );

  const handleCheckout = (e) => {
    e.preventDefault();
    handlePlaceOrder();
    setNotificationMessage("Order placed successfully!");
  };

  return (
    <div className="cart">
      <div className="cart-content">
        <div className="cart-header">
          <h1 className="cart-heading">
            Cart <span>({totalProducts} items)</span>
          </h1>
          {cart.length === 0 ? (
            <p>You have not added any product to your cart.</p>
          ) : null}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-content-grid">
            <div className="cart-content-products">
              {cartItems
                .filter((item) => (item.quantity || 0) > 0)
                .map((item) => {
                  const product = {
                    id: item.grocery?.id,
                    name: item.grocery?.name,
                    price: item.grocery?.price,
                    image: item.grocery?.imageUrl,
                    category: item.grocery?.category,
                    food_condition: item.grocery?.type,
                    unit: item.grocery?.unit,
                    quantity: item.quantity,
                  };

                  return (
                    <ProductInfo
                      key={item.grocery?.id}
                      product={product}
                    />
                  );
                })}
            </div>

            {totalProducts > 0 ? (
              <div className="cart-content-bill">
                <h3>Your order</h3>
                <div className="bill-info">
                  <div className="order-taxes">
                    <p>Taxes</p>
                    <p>$0.00</p>
                  </div>
                  <div className="order-shipping">
                    <p>Shipping</p>
                    <p>Free</p>
                  </div>
                </div>
                <div className="bill-total">
                  <p>Total</p>
                  <p>${totalPrice.toFixed(2)}</p>
                </div>
                <form onSubmit={handleCheckout}>
                  <button type="submit" className="btn-checkout">
                    Place Order
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {notificationMessage && <Notification message={notificationMessage} />}
    </div>
  );
}
