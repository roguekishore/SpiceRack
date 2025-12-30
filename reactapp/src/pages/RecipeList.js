import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/RecipeList.css';

function RecipeList() {
    const [recipes, setRecipes] = useState([]); // Initialize with an empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRecipe, setExpandedRecipe] = useState(null);
    const [nutritionData, setNutritionData] = useState({});
    const navigate = useNavigate();
    const handleAddRecipeClick = () => {
        navigate('/recipeform');
    };

    function convertToGramsAndFormatQuery(groceries) {
        const unitConversions = {
            kg: 1000,
            lbs: 453.592,
            oz: 28.3495,
            tablespoon: 14.787,
            teaspoon: 4.929,
            millilitre : 1,
            litre : 1000
        };

        const queryParts = groceries.map(groceryItem => {
            let quantityInGrams = groceryItem.quantity;
            let unit = groceryItem.unit.toLowerCase();

            if (unit !== 'g' && unitConversions[unit]) {
                quantityInGrams = groceryItem.quantity * unitConversions[unit];
                unit = 'grams';
            } else if (unit === 'g') {
                unit = 'grams';
                quantityInGrams = groceryItem.quantity;
            }

            return `${quantityInGrams.toFixed(0)} ${unit} ${groceryItem.grocery.name}`;
        });

        return queryParts.join(', ');
    }

    const getNutritionInfo = async (recipeId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/recipes/${recipeId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch required groceries');
            }
            const recipe = await response.json();
            const groceries = recipe.requiredGroceryDTOs;

            if (!groceries || groceries.length === 0) {
                console.log("No groceries required for this recipe.");
                return;
            }
            const query = convertToGramsAndFormatQuery(groceries);
            console.log(query);

            const apikey = '71nIIfqwD3beHEzEnE8s6Q==Xx0DzBtdVWGwbCeA';
            const apiResponse = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'X-Api-Key': apikey,
                    'Content-Type': 'application/json'
                }
            });

            if (!apiResponse.ok) {
                throw new Error('Failed to fetch nutritional information');
            }

            const result = await apiResponse.json();
            console.log("Nutritional Info:", result);

            const aggregatedData = {};
            result.items.forEach(item => {
                for (const key in item) {
                    if (typeof item[key] === 'number') {
                        aggregatedData[key] = (aggregatedData[key] || 0) + item[key];
                    }
                }
            });

            setNutritionData({ ...nutritionData, [recipeId]: aggregatedData });

        } catch (error) {
            console.error('Error:', error.message);
        }
    };


    useEffect(() => {
        setLoading(true);
        fetch(`${process.env.REACT_APP_API_URL}/api/recipes`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setRecipes(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching recipes:', error);
                setError('Failed to load recipes. Please try again later.');
                setLoading(false);
            });
    }, []);

    const toggleRecipeExpansion = (recipeId) => {
        if (expandedRecipe === recipeId) {
            setExpandedRecipe(null);
        } else {
            setExpandedRecipe(recipeId);
        }
    };

    const navigateToUserRecipes = () => {
        navigate('/userrecipes');
    }

    // Helper function to get instructions as an array
    const getInstructionsArray = (recipe) => {
        // First try to use instructionsList if available
        if (recipe.instructionsList && Array.isArray(recipe.instructionsList)) {
            return recipe.instructionsList;
        }
        // Fall back to splitting the instructions string
        else if (recipe.instructions) {
            return recipe.instructions.split('; ');
        }
        // Return empty array if neither is available
        return [];
    };

    if (loading) {
        return (
            <div className="recipe-list-container">
                <div className="loading-indicator">
                    <div className="spinner"></div>
                    <p>Loading recipes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="recipe-list-container">
                <div className="error-message">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="list-btn btn-primary">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="recipe-list-container">
            <div className="recipe-list-header">
                <h1 className="page-title">Recipe Collection</h1>
                <p className="recipe-count">{recipes.length} {recipes.length === 1 ? 'Recipe' : 'Recipes'} Available</p>
                <div className="user-recipe-container">
                <button className='add-recipe-btn' onClick={handleAddRecipeClick}>Add a recipe</button>
                <button className='add-recipe-btn' onClick={navigateToUserRecipes}>My Recipes</button>
                </div>
            </div>

            {recipes.length === 0 ? (
                <div className="no-recipes-message">
                    <p>No recipes found. Add your first recipe to get started.</p>
                </div>
            ) : (
                <div className="recipe-list">
                    {recipes.map((recipe) => (
                        <div key={recipe.id} className="recipe-item">
                            <div className="recipe-card">
                                <div
                                    className="recipe-card-header"
                                    onClick={() => toggleRecipeExpansion(recipe.id)}
                                >
                                    <h2 className="recipe-title">{recipe.name}</h2>
                                    <div className="recipe-meta">
                                        <span className='prep-time'>by {recipe.user.name}</span>
                                        <span className="prep-time">
                                            <svg className="recipes-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <polyline points="12 6 12 12 16 14"></polyline>
                                            </svg>
                                            {recipe.minutes} min
                                        </span>
                                        <span className="ingredients-count">
                                            <svg className="recipes-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 6h18"></path>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                            {recipe.requiredGroceryDTOs ? recipe.requiredGroceryDTOs.length : 0} items
                                        </span>
                                    </div>
                                    <div className="expand-indicator">
                                        {expandedRecipe === recipe.id ? '−' : '+'}
                                    </div>
                                </div>
                            </div>
                            <div className={`recipe-card-content ${expandedRecipe === recipe.id ? 'expanded' : ''}`}>
                                <div className="recipe-section">
                                    <h3 className="section-title">Instructions</h3>
                                    <ol className="instructions-list">
                                        {getInstructionsArray(recipe).map((instruction, index) => (
                                            <li key={index} className="instruction-item">
                                                {instruction}
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                <div className="recipe-section">
                                    <h3 className="section-title">Required Groceries</h3>
                                    {recipe.requiredGroceryDTOs && recipe.requiredGroceryDTOs.length > 0 ? (
                                        <ul className="groceries-list">
                                            {recipe.requiredGroceryDTOs.map((groceryItem, index) => (
                                                <li key={index} className="grocery-item">
                                                    <div className="grocery-image-container">
                                                        {groceryItem.grocery.imageUrl ? (
                                                            <img
                                                                src={groceryItem.grocery.imageUrl}
                                                                alt={groceryItem.grocery.name}
                                                                className="grocery-image"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = 'https://placehold.co/100x100?text=No+Image';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="image-placeholder">
                                                                {groceryItem.grocery.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="grocery-details">
                                                        <span className="grocery-name">{groceryItem.grocery.name.charAt(0).toUpperCase() + groceryItem.grocery.name.slice(1)}</span>
                                                        <span className="grocery-category">{groceryItem.grocery.category}</span>
                                                        <span className="grocery-quantity">{groceryItem.quantity} {groceryItem.unit}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="no-groceries-message">No groceries required for this recipe.</p>
                                    )}
                                    <button className='nutrition-button' onClick={() => getNutritionInfo(recipe.id)}>Get Nutritional Information</button>
                                    {nutritionData[recipe.id] && (
                                        <ul className="nutrition-list">
                                            {Object.entries(nutritionData[recipe.id]).map(([key, value]) => (
                                                <li key={key}>
                                                    <span>{key.replace(/_/g, ' ')}</span>
                                                    <span>{value.toFixed(2)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default RecipeList;