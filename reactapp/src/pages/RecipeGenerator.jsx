import React, { useState } from "react";
import axios from "axios";
import { Sparkles, Plus, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

const RecipeGenerator = () => {
  const [groceryItems, setGroceryItems] = useState([]);
  const [input, setInput] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddItem = () => {
    if (input.trim() !== "") {
      setGroceryItems([...groceryItems, input.trim()]);
      setInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...groceryItems];
    updatedItems.splice(index, 1);
    setGroceryItems(updatedItems);
  };

  const generateRecipe = async () => {
    if (groceryItems.length === 0) {
      alert("Please add at least one ingredient.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.REACT_APP_API_URL}/api/recipes/generate`, groceryItems, {
        headers: { "Content-Type": "application/json" }
      });
      setRecipe(response.data);
    } catch (error) {
      console.error("Error generating recipe:", error);
      setRecipe("Failed to generate recipe. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Recipe Generator</CardTitle>
            <CardDescription>Enter your ingredients and let AI create a recipe for you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter ingredient..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            {/* Ingredients List */}
            {groceryItems.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {groceryItems.map((item, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1.5 text-sm">
                    {item}
                    <button
                      className="ml-2 hover:text-destructive"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={generateRecipe}
              disabled={loading || groceryItems.length === 0}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Recipe
                </>
              )}
            </Button>

            {/* Generated Recipe */}
            {recipe && (
              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Generated Recipe:</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{recipe}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecipeGenerator;
