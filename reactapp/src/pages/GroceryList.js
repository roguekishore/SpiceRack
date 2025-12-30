import { useEffect, useState } from "react";
//import "../css/GroceryList.css";
import "../App.css"

const GroceryList = ({ selectedGroceries, onSelectGrocery }) => {
  const [groceries, setGroceries] = useState([]);
  const [quantity, setQuantity] = useState(0); // Mock quantity state

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/groceries`)
      .then((response) => response.json())
      .then((data) => setGroceries(data))
      .catch((error) => console.error("Error fetching groceries:", error));
  }, []);

  // Mock functions for button clicks (to avoid errors)
  const handleProductAdd = (item) => {
    // console.log("Add:", item);
  };

  const handleProductDelete = (id) => {
    // console.log("Delete:", id);
  };

  const handleProductFavorite = (item) => {
    // console.log("Favorite:", item);
  };

  const handleProductFavoriteDelete = (id) => {
    // console.log("Unfavorite:", id);
  };

  return (
    <div className="product">
      <h2 className="text-2xl font-bold mb-4">Grocery List</h2>
      <div className="products-content"> {/* Original grid layout */}
        {groceries.map((item) => (
          <div key={item.id} className="product">
            <div className="product-content">
              <button type="button" className="btn-favorite" onClick={() => handleProductFavorite(item)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256">
                  <path fill="currentColor" d="M178 32c-20.65 0-38.73 8.88-50 23.89C116.73 40.88 98.65 32 78 32a62.07 62.07 0 0 0-62 62c0 70 103.79 126.66 108.21 129a8 8 0 0 0 7.58 0C136.21 220.66 240 164 240 94a62.07 62.07 0 0 0-62-62Zm-50 174.8C109.74 196.16 32 147.69 32 94a46.06 46.06 0 0 1 46-46c19.45 0 35.78 10.36 42.6 27a8 8 0 0 0 14.8 0c6.82-16.67 23.15-27 42.6-27a46.06 46.06 0 0 1 46 46c0 53.61-77.76 102.15-96 112.8Z" />
                </svg>
              </button>
              <div className="product-content-image">
                <img
                  src={item.imageUrl}
                  width="128"
                  height="128"
                  className="product-image"
                  alt={item.name}
                />
              </div>
              <div className="product-info">
                <h3>{item.name}</h3>
                <p>{item.name}</p> {/* Commented out food condition */}
              </div>
              <div className="product-price">
                <h3>
                  ${item.price} <span>per kg</span>
                </h3>
                <div className="product-btns">
                  {quantity === 0 ? (
                    <button
                      type="button"
                      className="product-btn-add"
                      onClick={() => handleProductAdd(item)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.883 3.007 12 3a1 1 0 0 1 .993.883L13 4v7h7a1 1 0 0 1 .993.883L21 12a1 1 0 0 1-.883.993L20 13h-7v7a1 1 0 0 1-.883.993L12 21a1 1 0 0 1-.993-.883L11 20v-7H4a1 1 0 0 1-.993-.883L3 12a1 1 0 0 1 .883-.993L4 11h7V4a1 1 0 0 1 .883-.993L12 3l-.117.007Z" />
                      </svg>
                      Add
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="product-btn-add"
                        onClick={() => handleProductDelete(item.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3.997 13H20a1 1 0 1 0 0-2H3.997a1 1 0 1 0 0 2Z" />
                        </svg>
                      </button>
                      <strong>{quantity}</strong>
                      <button
                        type="button"
                        className="product-btn-add"
                        onClick={() => handleProductAdd(item)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.883 3.007 12 3a1 1 0 0 1 .993.883L13 4v7h7a1 1 0 0 1 .993.883L21 12a1 1 0 0 1-.883.993L20 13h-7v7a1 1 0 0 1-.883.993L12 21a1 1 0 0 1-.993-.883L11 20v-7H4a1 1 0 0 1-.993-.883L3 12a1 1 0 0 1 .883-.993L4 11h7V4a1 1 0 0 1 .883-.993L12 3l-.117.007Z" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroceryList;