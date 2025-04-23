import { Link } from 'react-router-dom';
import '../css/Home.css';
import { useState } from 'react';
import { ShoppingCart, Book, Apple, Calendar, Package, Clipboard } from 'lucide-react';

export default function Home() {
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [isRecipeHovered, setIsRecipeHovered] = useState(false);
  const [isProductHovered, setIsProductHovered] = useState(false);
  const [isMealplanHovered, setIsMealplanHovered] = useState(false);
  const [isOrdersHovered, setIsOrdersHovered] = useState(false);
  const [isInventoryHovered, setIsInventoryHovered] = useState(false);
  const iconsize = 35;

  return (
    <div className="home">
      <div className="home-container">
        <div className="home-content">

        <div className="hero-section">
            <div className="hero-content">
              <h1 className="main-title">
                Discover Freshness <br /> Delivered to Your Door
              </h1>
              <p className="tagline">
                From crisp vegetables to gourmet delights, find everything you need <br /> to create delicious meals and nourish your well-being.
              </p>
              <Link to="/products" className="product-button">
                Explore Our Products
              </Link>
            </div>
          </div>

          <div className="hero-section-alt">
            <div className="hero-content-alt">
              <h1 className="main-title">
                Unlock Your Inner Chef <br /> With Our Recipe Collection
              </h1>
              <p className="tagline">
                Browse thousands of recipes, from quick weeknight dinners to <br /> elaborate weekend feasts, all featuring fresh, quality ingredients.
              </p>
              <Link to="/recipes" className="product-button" style={{ backgroundColor: "rgb(180, 45, 24)" }}>
                Find Recipe Inspiration
              </Link>
            </div>
          </div>

          <div className="feature-grid">
            {/* Products Box */}
            <Link to="/products" className="feature-box">
              <div
                className="feature-content"
                onMouseEnter={() => setIsProductHovered(true)}
                onMouseLeave={() => setIsProductHovered(false)}
              >
                <div className="feature-text">
                  <h2>Farm-Fresh Produce</h2>
                  <p>Explore our vibrant selection of seasonal fruits and vegetables.</p>
                </div>
                <div className="feature-icon product-icon">
                  <Apple
                    size={iconsize}
                    className={`icon ${isProductHovered ? 'bounce' : ''}`}
                  />
                </div>
              </div>
            </Link>

            {/* Recipes Box */}
            <Link to="/recipes" className="feature-box">
              <div
                className="feature-content"
                onMouseEnter={() => setIsRecipeHovered(true)}
                onMouseLeave={() => setIsRecipeHovered(false)}
              >
                <div className="feature-text">
                  <h2>Culinary Inspirations</h2>
                  <p>Unlock a world of delicious recipes and cooking guides.</p>
                </div>
                <div className="feature-icon recipe-icon">
                  <Book
                    size={iconsize}
                    className={`icon ${isRecipeHovered ? 'open-book' : ''}`}
                  />
                </div>
              </div>
            </Link>

            {/* Cart Box */}
            <Link to="/cart" className="feature-box">
              <div
                className="feature-content"
                onMouseEnter={() => setIsCartHovered(true)}
                onMouseLeave={() => setIsCartHovered(false)}
              >
                <div className="feature-text">
                  <h2>Shopping Cart</h2>
                  <p>Review and manage your selected items with ease.</p>
                </div>
                <div className="feature-icon cart-icon">
                  <ShoppingCart
                    size={iconsize}
                    className="icon"
                  />
                  {isCartHovered && (
                    <>
                      <div className="cart-item item1"></div>
                      <div className="cart-item item2"></div>
                      <div className="cart-item item3"></div>
                    </>
                  )}
                </div>
              </div>
            </Link>

            {/* Meal Plan Box */}
            <Link to="/mealplan" className="feature-box">
              <div
                className="feature-content"
                onMouseEnter={() => setIsMealplanHovered(true)}
                onMouseLeave={() => setIsMealplanHovered(false)}
              >
                <div className="feature-text">
                  <h2>Weekly Meal Planner</h2>
                  <p>Organize your meals and simplify your grocery shopping.</p>
                </div>
                <div className="feature-icon mealplan-icon">
                  <Calendar
                    size={iconsize}
                    className={`icon ${isMealplanHovered ? 'pulse' : ''}`}
                  />
                </div>
              </div>
            </Link>

            {/* Orders Box */}
            <Link to="/orders" className="feature-box">
              <div
                className="feature-content"
                onMouseEnter={() => setIsOrdersHovered(true)}
                onMouseLeave={() => setIsOrdersHovered(false)}
              >
                <div className="feature-text">
                  <h2>Order History</h2>
                  <p>Track the status of your past and current orders.</p>
                </div>
                <div className="feature-icon orders-icon">
                  <Package
                    size={iconsize}
                    className={`icon ${isOrdersHovered ? 'shake' : ''}`}
                  />
                </div>
              </div>
            </Link>

            {/* Inventory Box */}
            <Link to="/inventory" className="feature-box">
              <div
                className="feature-content"
                onMouseEnter={() => setIsInventoryHovered(true)}
                onMouseLeave={() => setIsInventoryHovered(false)}
              >
                <div className="feature-text">
                  <h2>Your Inventory</h2>
                  <p>Keep track of your pantry and manage your household inventory.</p>
                </div>
                <div className="feature-icon inventory-icon">
                  <Clipboard
                    size={iconsize}
                    className={`icon ${isInventoryHovered ? 'flip' : ''}`}
                  />
                </div>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}