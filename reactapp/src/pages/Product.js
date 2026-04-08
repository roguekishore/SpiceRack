import { Link } from "react-router-dom";
import { useContext, useState, useEffect, useCallback, useRef } from "react";
import { X, Search, Filter, Plus, Minus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { UserContext } from "../context/UserContext";
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { cn } from '../lib/utils';

// Debounce hook for delayed API calls
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

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
  const [localQuantities, setLocalQuantities] = useState({});
  const quantityTimeouts = useRef({});
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchGroceries();
  }, [debouncedSearchTerm, currentPage, pageSize, sortBy, ascending, filterType, filterCategory]);

  const fetchGroceries = () => {
    let url = `${process.env.REACT_APP_API_URL}/api/groceries/paginated?page=${currentPage}&size=${pageSize}&sortBy=${sortBy}&ascending=${ascending}`;
    if (searchTerm) url += `&name=${encodeURIComponent(searchTerm.toLowerCase())}`;
    if (filterType !== "All") url += `&type=${encodeURIComponent(filterType.toLowerCase())}`;
    if (filterCategory !== "All") url += `&category=${encodeURIComponent(filterCategory.toLowerCase())}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => setPage(data))
      .catch((error) => {});
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(0);
  };

  const getCartItem = (groceryId) => {
    if (!cart || cart.length === 0) return null;
    return cart.find((item) => item.grocery.id === groceryId) || null;
  };

  if (!page || !page.content) {
    return (
      <div className="min-h-screen pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Products</h1>
          <p className="text-muted-foreground">Browse our selection of fresh groceries</p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search groceries..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle for Mobile */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>

          {/* Filters */}
          <div className={cn(
            "grid gap-4 md:grid-cols-5",
            isFiltersOpen ? "grid" : "hidden md:grid"
          )}>
            <div className="space-y-2">
              <Label>Page Size</Label>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(0); }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="8">8</option>
                <option value="16">16</option>
                <option value="24">24</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Sort By</Label>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(0); }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="id">ID</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Order</Label>
              <select
                value={ascending ? "asc" : "desc"}
                onChange={(e) => { setAscending(e.target.value === "asc"); setCurrentPage(0); }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setCurrentPage(0); }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="All">All</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(0); }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="All">All</option>
                <option value="Fruits">Fruits</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Meat">Meat</option>
                <option value="Dairy">Dairy</option>
                <option value="Pantry">Pantry</option>
                <option value="Seafood">Seafood</option>
                <option value="Supplement">Supplement</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {page.content.map((item) => {
            const cartItem = getCartItem(item.id);
            const quantity = cartItem ? cartItem.quantity : 0;

            return (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative aspect-square bg-muted">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge
                    variant={item.type?.toLowerCase() === "vegetarian" ? "default" : "destructive"}
                    className="absolute top-2 right-2"
                  >
                    {item.type?.toLowerCase() === "vegetarian" ? "Veg" : "Non-Veg"}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold capitalize">{item.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold">
                        ${item.price}
                        <span className="text-sm font-normal text-muted-foreground"> / {item.unit}</span>
                      </p>
                    </div>
                    
                    {/* Add to Cart / Quantity Controls */}
                    <div className="pt-2">
                      {quantity === 0 ? (
                        <Button
                          className="w-full"
                          onClick={() => {
                            const groceryData = {
                              id: item.id,
                              name: item.name,
                              price: item.price,
                              unit: item.unit,
                              category: item.category,
                              type: item.type,
                              imageUrl: item.imageUrl
                            };
                            handleProductAdd(item.id, groceryData);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const newQty = Math.round((quantity - 1) * 10) / 10;
                              if (newQty <= 0) {
                                handleProductDelete(item.id);
                              } else {
                                handleUpdateQuantity(item.id, newQty);
                              }
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={localQuantities[item.id] !== undefined ? localQuantities[item.id] : quantity}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              if (inputValue === '' || inputValue === '-') {
                                setLocalQuantities(prev => ({ ...prev, [item.id]: '' }));
                                return;
                              }
                              const newValue = parseFloat(inputValue);
                              if (!isNaN(newValue) && newValue >= 0) {
                                const roundedVal = Math.round(newValue * 10) / 10;
                                setLocalQuantities(prev => ({ ...prev, [item.id]: roundedVal }));
                                if (quantityTimeouts.current[item.id]) {
                                  clearTimeout(quantityTimeouts.current[item.id]);
                                }
                                quantityTimeouts.current[item.id] = setTimeout(() => {
                                  if (roundedVal <= 0) {
                                    handleProductDelete(item.id);
                                  } else {
                                    handleUpdateQuantity(item.id, roundedVal);
                                  }
                                  setLocalQuantities(prev => {
                                    const updated = { ...prev };
                                    delete updated[item.id];
                                    return updated;
                                  });
                                }, 500);
                              }
                            }}
                            className="w-16 text-center"
                            min="0"
                            step="0.1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const newQty = Math.round((quantity + 1) * 10) / 10;
                              handleUpdateQuantity(item.id, newQty);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {page.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= page.totalPages - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}