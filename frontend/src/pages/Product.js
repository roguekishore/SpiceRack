import { Link } from "react-router-dom";
import { useContext, useState, useEffect } from "react";

import { ChevronDown, Search, X, Filter } from 'lucide-react';
import { UserContext } from "../context/UserContext";
import '../css/Product.css';

export default function Product() {
  const { handleProductAdd, handleProductDelete, handleUpdateQuantity, cart } = useContext(UserContext);
  const [page, setPage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(8);
  const [sortBy, setSortBy] = useState("id");
  const [ascending, setAscending] = useState(true);
  const [filterType, setFilterType] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // For mobile dropdown only
  const toggleFilters = () => {
    setIsFiltersOpen(prev => !prev);
  };
  

  useEffect(() => {
    fetchGroceries();
  }, [searchTerm, currentPage, pageSize, sortBy, ascending, filterType, filterCategory]);

  const fetchGroceries = () => {
    let url = `${process.env.REACT_APP_API_URL}/api/groceries/paginated?page=${currentPage}&size=${pageSize}&sortBy=${sortBy}&ascending=${ascending}`;

    if (searchTerm) {
      url += `&name=${encodeURIComponent(searchTerm.toLowerCase())}`;
    }

    if (filterType !== "All") {
      url += `&type=${encodeURIComponent(filterType.toLowerCase())}`;
    }

    if (filterCategory !== "All") {
      url += `&category=${encodeURIComponent(filterCategory.toLowerCase())}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => setPage(data))
      .catch((error) => console.error("Error fetching groceries:", error));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(0);
  };

  const handleNextPage = () => {
    if (page && currentPage < page.totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(0);
  };

  const handleAscendingChange = () => {
    setAscending(!ascending);
    setCurrentPage(0);
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(0);
  };

  const handleFilterCategoryChange = (e) => {
    setFilterCategory(e.target.value);
    setCurrentPage(0);
  };

  const getCartItem = (groceryId) => {
    if (!cart || cart.length === 0) {
      return null;
    }
    return cart.find((item) => item.grocery.id === groceryId) || null;
  };

  if (!page || !page.content) {
    return (
      <div className="product-container center-content">
        <div className="search-container">
          <button className="search-icon-button">
            <Filter size={20} />
          </button>
          <input
            type="text"
            placeholder="Search groceries"
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button onClick={handleClearSearch} className="clear-search-button">
            <X size={16} />
          </button>
        </div>
        <div className="loading-message">Loading the groceries</div>
      </div>
    );
  }

  return (
    <div className="product-container">
      <div className="product">

      {/* Desktop Layout */}
      <div className="desktop-search-controls">
        {/* Search Input */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search groceries"
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button onClick={handleClearSearch} className="clear-search-button">
            <X size={16} />
          </button>
        </div>
        
        {/* Desktop Filter Bar - New horizontal filter bar */}
        <div className="desktop-filter-bar">
          <div className="filter-group">
            <label>Page Size:</label>
            <select className="option-select" value={pageSize} onChange={handlePageSizeChange}>
              <option value="8">8</option>
              <option value="16">16</option>
              <option value="24">24</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Sort By:</label>
            <select className="option-select" value={sortBy} onChange={handleSortByChange}>
              <option value="id">ID</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
            </select>
          </div>
          
          <div className="filter-group">
            <div className="checkbox-group">
              <label>Ascending:</label>
              <input 
                type="checkbox" 
                checked={ascending} 
                onChange={handleAscendingChange} 
              />
            </div>
          </div>
          
          <div className="filter-group">
            <label>Type:</label>
            <select className="option-select" value={filterType} onChange={handleFilterTypeChange}>
              <option value="All">All</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Category:</label>
            <select className="option-select" value={filterCategory} onChange={handleFilterCategoryChange}>
              <option value="All">All</option>
              <option value="Fruits">Fruits</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Meat">Meat</option>
              <option value="Dairy">Dairy</option>
              <option value="Pantry">Pantry</option>
              <option value="Seafood">Sea Food</option>
              <option value="Supplement">Supplement</option>
            </select>
          </div>
        </div>
        
        {/* Keep this for compatibility with existing code but it will be hidden with CSS */}
        <div className="filter-icon-container">
          <button className="filter-icon-button">
            <Filter size={20} />
          </button>
          
          <div className="desktop-filter-options">
            {/* This content will be hidden by CSS */}
          </div>
        </div>
      </div>
      
      {/* Mobile Search Controls - unchanged */}
      <div className="mobile-search-controls">
        <div className="search-container">
          <button className="search-icon-button" onClick={toggleFilters}>
            <Filter size={20} />
          </button>

          <input
            type="text"
            placeholder="Search groceries"
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button onClick={handleClearSearch} className="clear-search-button">
            <X size={16} />
          </button>
        </div>
        
        {/* Mobile Filters Dropdown - unchanged */}
        <div className="filter-dropdown">
          <div className={`filter-dropdown-content ${isFiltersOpen ? 'active' : ''}`}>
            <div className="filter-group">
              <label>Page Size:</label>
              <select className="option-select" value={pageSize} onChange={handlePageSizeChange}>
                <option value="8">8</option>
                <option value="16">16</option>
                <option value="24">24</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Sort By:</label>
              <select className="option-select" value={sortBy} onChange={handleSortByChange}>
                <option value="id">ID</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
              </select>
            </div>
            
            <div className="filter-group">
              <div className="checkbox-group">
                <label>Ascending:</label>
                <input 
                  type="checkbox" 
                  checked={ascending} 
                  onChange={handleAscendingChange} 
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Type:</label>
              <select className="option-select" value={filterType} onChange={handleFilterTypeChange}>
                <option value="All">All</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Category:</label>
              <select className="option-select" value={filterCategory} onChange={handleFilterCategoryChange}>
                <option value="All">All</option>
                <option value="Fruits">Fruits</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Meat">Meat</option>
                <option value="Dairy">Dairy</option>
                <option value="Pantry">Pantry</option>
                <option value="Seafood">Sea Food</option>
                <option value="Supplement">Supplement</option>
              </select>
            </div>
          </div>
        </div>
      </div>

        {/* Rest of component remains unchanged */}
        <div className="products-content">
          {page.content.map((item) => {
            const cartItem = getCartItem(item.id);
            const quantity = cartItem ? cartItem.quantity : 0;

            return (
              <div key={item.id} className="product-content">
                {/* Product item content remains unchanged */}
                <div className="product-content-image">
                  <Link to={`${item.imageUrl}`} className="product-link">
                    <img
                      src={item.imageUrl}
                      width="128"
                      height="128"
                      className="product-image"
                      alt={item.name}
                    />
                  </Link>
                </div>
                <div className="product-info">
                  <h3>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</h3>
                  <p>{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</p>
                </div>
                <div className="product-price">
                  <h3>
                    ${item.price} <span>per {item.unit}</span>
                  </h3>
                  <div className="product-btns">
                    {quantity === 0 ? (
                      <button type="button" className="product-add" onClick={() => handleProductAdd(item.id)}>
                        <svg width="16" height="16" viewBox="0 0 24 24">
                          <path d="M11.883 3.007 12 3a1 1 0 0 1 .993.883L13 4v7h7a1 1 0 0 1 .993.883L21 12a1 1 0 0 1-.883.993L20 13h-7v7a1 1 0 0 1-.883.993L12 21a1 1 0 0 1-.993-.883L11 20v-7H4a1 1 0 0 1-.993-.883L3 12a1 1 0 0 1 .883-.993L4 11h7V4a1 1 0 0 1 .883-.993L12 3l-.117.007Z" />
                        </svg>
                        Add
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="product-btn-add"
                          onClick={() => {
                            if (quantity === 0.1) {
                              handleProductDelete(item.id);
                            } else {
                              handleUpdateQuantity(item.id, parseFloat((quantity - 0.1).toFixed(1)));
                            }
                          }}
                          disabled={quantity <= 0}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24">
                            <path d="M3.997 13H20a1 1 0 1 0 0-2H3.997a1 1 0 1 0 0 2Z" />
                          </svg>
                        </button>

                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => {
                            const newValue = parseFloat(e.target.value);
                            if (newValue >= 0.1) {
                              handleUpdateQuantity(item.id, newValue);
                            } else if (newValue === 0) {
                              handleProductDelete(item.id);
                            }
                          }}
                          min="0.1"
                          step="0.1"
                          className="product-quantity-input"
                        />

                        <button
                          type="button"
                          className="product-btn-add"
                          onClick={() => {
                            if (quantity === 0) {
                              handleUpdateQuantity(item.id, 0.1);
                            } else {
                              handleUpdateQuantity(item.id, parseFloat((quantity + 0.1).toFixed(1)));
                            }
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24">
                            <path d="M11.883 3.007 12 3a1 1 0 0 1 .993.883L13 4v7h7a1 1 0 0 1 .993.883L21 12a1 1 0 0 1-.883.993L20 13h-7v7a1 1 0 0 1-.883.993L12 21a1 1 0 0 1-.993-.883L11 20v-7H4a1 1 0 0 1-.993-.883L3 12a1 1 0 0 1 .883-.993L4 11h7V4a1 1 0 0 1 .883-.993L12 3l-.117.007Z" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="type-indicator">
                  <div className="type-rectangle">
                    <div className={`type-circle ${item.type.toLowerCase() === "vegetarian" ? "vegetarian" : "non-vegetarian"}`}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="pagination-controls">
          <button onClick={handlePreviousPage} disabled={currentPage === 0}>Previous</button>
          <span>Page {currentPage + 1} of {page.totalPages}</span>
          <button onClick={handleNextPage} disabled={currentPage >= page.totalPages - 1}>Next</button>
        </div>
      </div>
    </div>
  );
}