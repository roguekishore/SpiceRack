import React, { useState } from "react";
import axios from "axios";

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
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/recipes/generate`, groceryItems, {
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
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-4">Recipe Generator</h1>

      <div className="flex space-x-2">
        <input
          type="text"
          className="border p-2 w-full rounded"
          placeholder="Enter ingredient..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleAddItem}
        >
          Add
        </button>
      </div>

      <ul className="mt-4">
        {groceryItems.map((item, index) => (
          <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded mt-2">
            {item}
            <button
              className="text-red-500"
              onClick={() => handleRemoveItem(index)}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>

      <button
        className="bg-green-500 text-white px-4 py-2 mt-4 w-full rounded"
        onClick={generateRecipe}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Recipe"}
      </button>

      {recipe && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold">Generated Recipe:</h2>
          <p className="mt-2">{recipe}</p>
        </div>
      )}
    </div>
  );
};

export default RecipeGenerator;
