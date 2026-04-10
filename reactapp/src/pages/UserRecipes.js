import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { Clock, Package, ChevronDown, ChevronUp, Plus, Users, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { cn } from '../lib/utils';

function UserRecipes() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRecipe, setExpandedRecipe] = useState(null);
    const [nutritionData, setNutritionData] = useState({});
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    const handleAddRecipeClick = () => {
        navigate('/recipeform');
    };

    const navigateToRecipes = () => {
        navigate('/recipes');
    };

    function convertToGramsAndFormatQuery(groceries) {
        const unitConversions = {
            kg: 1000,
            lbs: 453.592,
            oz: 28.3495,
            tablespoon: 14.787,
            teaspoon: 4.929,
            millilitre: 1,
            litre: 1000
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
        if (!user?.id) return;
        setLoading(true);
        fetch(`${process.env.REACT_APP_API_URL}/api/recipes/user/${user.id}`)
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
    }, [user?.id]);

    const toggleRecipeExpansion = (recipeId) => {
        if (expandedRecipe === recipeId) {
            setExpandedRecipe(null);
        } else {
            setExpandedRecipe(recipeId);
        }
    };

    const getInstructionsArray = (recipe) => {
        if (Array.isArray(recipe.instructions)) {
            return recipe.instructions;
        } else if (typeof recipe.instructions === 'string') {
            return recipe.instructions.split('; ');
        }
        return [];
    };

    if (!user) {
        return (
            <div className="min-h-screen pt-20 pb-8">
                <div className="container mx-auto px-4">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">Your Recipes</h1>
                    </div>
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground mb-4">Please login to view and create your own recipes.</p>
                            <Button onClick={() => navigate('/login')}>
                                Login / Sign Up
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-20 pb-8 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading recipes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-20 pb-8">
                <div className="container mx-auto px-4">
                    <Card className="max-w-md mx-auto text-center">
                        <CardContent className="py-8">
                            <h2 className="text-lg font-semibold mb-2">Error</h2>
                            <p className="text-muted-foreground mb-4">{error}</p>
                            <Button onClick={() => window.location.reload()}>
                                Retry
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Your Recipes</h1>
                            <p className="text-muted-foreground">
                                {recipes.length} {recipes.length === 1 ? 'Recipe' : 'Recipes'} Created
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleAddRecipeClick}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Recipe
                            </Button>
                            <Button variant="outline" onClick={navigateToRecipes}>
                                <Users className="h-4 w-4 mr-2" />
                                Community Recipes
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Recipe List */}
                {recipes.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">No recipes found. Add your first recipe to get started.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {recipes.map((recipe) => (
                            <Card key={recipe.id} className="overflow-hidden">
                                {/* Recipe Header */}
                                <div
                                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => toggleRecipeExpansion(recipe.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h2 className="text-lg font-semibold">{recipe.name}</h2>
                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {recipe.minutes} min
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Package className="h-4 w-4" />
                                                    {recipe.requiredGroceryDTOs ? recipe.requiredGroceryDTOs.length : 0} items
                                                </span>
                                            </div>
                                        </div>
                                        {expandedRecipe === recipe.id ? (
                                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                <div className={cn(
                                    "overflow-hidden transition-all duration-300",
                                    expandedRecipe === recipe.id ? "max-h-[2000px]" : "max-h-0"
                                )}>
                                    <Separator />
                                    <CardContent className="pt-4">
                                        {/* Instructions */}
                                        <div className="mb-6">
                                            <h3 className="font-semibold mb-3">Instructions</h3>
                                            <ol className="list-decimal list-inside space-y-2">
                                                {getInstructionsArray(recipe).map((instruction, index) => (
                                                    <li key={index} className="text-sm text-muted-foreground pl-2">
                                                        {instruction}
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>

                                        {/* Required Groceries */}
                                        <div>
                                            <h3 className="font-semibold mb-3">Required Groceries</h3>
                                            {recipe.requiredGroceryDTOs && recipe.requiredGroceryDTOs.length > 0 ? (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                                                    {recipe.requiredGroceryDTOs.map((groceryItem, index) => (
                                                        <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                                            <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                                                {groceryItem.grocery.imageUrl ? (
                                                                    <img
                                                                        src={groceryItem.grocery.imageUrl}
                                                                        alt={groceryItem.grocery.name}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            e.target.onerror = null;
                                                                            e.target.src = 'https://placehold.co/100x100?text=No+Image';
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-sm font-medium">
                                                                        {groceryItem.grocery.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium truncate">
                                                                    {groceryItem.grocery.name.charAt(0).toUpperCase() + groceryItem.grocery.name.slice(1)}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {groceryItem.quantity} {groceryItem.unit}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground mb-4">No groceries required for this recipe.</p>
                                            )}

                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    getNutritionInfo(recipe.id);
                                                }}
                                            >
                                                Get Nutritional Information
                                            </Button>

                                            {nutritionData[recipe.id] && (
                                                <div className="mt-4 p-4 rounded-lg bg-muted/50">
                                                    <h4 className="font-medium mb-2">Nutritional Information</h4>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                        {Object.entries(nutritionData[recipe.id]).map(([key, value]) => (
                                                            <div key={key} className="flex justify-between text-sm">
                                                                <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                                                                <span className="font-medium">{value.toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserRecipes;