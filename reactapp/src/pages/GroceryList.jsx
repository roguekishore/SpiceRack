import { useEffect, useState } from "react";
import { Heart, Plus, Minus } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const GroceryList = ({ selectedGroceries, onSelectGrocery }) => {
  const [groceries, setGroceries] = useState([]);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    fetch(`${import.meta.env.REACT_APP_API_URL}/api/groceries`)
      .then((response) => response.json())
      .then((data) => setGroceries(data))
      .catch((error) => console.error("Error fetching groceries:", error));
  }, []);

  const handleProductAdd = (item) => {
    // console.log("Add:", item);
  };

  const handleProductDelete = (id) => {
    // console.log("Delete:", id);
  };

  const handleProductFavorite = (item) => {
    // console.log("Favorite:", item);
  };

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold tracking-tight mb-6">Grocery List</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {groceries.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 h-8 w-8"
                    onClick={() => handleProductFavorite(item)}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <div className="flex justify-center mb-3">
                    <img
                      src={item.imageUrl}
                      width="128"
                      height="128"
                      className="rounded-md object-cover"
                      alt={item.name}
                    />
                  </div>
                  <div className="text-center mb-3">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold">${item.price}</span>
                      <span className="text-sm text-muted-foreground ml-1">per {item.unit}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {quantity === 0 ? (
                        <Button size="sm" onClick={() => handleProductAdd(item)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      ) : (
                        <>
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleProductDelete(item.id)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{quantity}</span>
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleProductAdd(item)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroceryList;