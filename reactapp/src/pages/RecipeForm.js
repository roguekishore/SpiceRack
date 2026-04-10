import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { Plus, Minus, X, Check, ChevronDown, ChevronUp, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { cn } from '../lib/utils';

function RecipeForm() {
    const [recipe, setRecipe] = useState({
        name: '',
        minutes: 0,
    });
    const [instructions, setInstructions] = useState(['']);
    const [groceries, setGroceries] = useState([]);
    const [selectedGroceries, setSelectedGroceries] = useState([]);
    const [selectedGroceryIds, setSelectedGroceryIds] = useState(new Set());
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const { user, requireAuth } = useContext(UserContext);
    const userId = user?.id;

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/groceries/all`)
            .then((response) => response.json())
            .then((data) => setGroceries(data))
            .catch(() => {});
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'minutes') {
            setRecipe({ ...recipe, [name]: parseInt(value) });
        } else {
            setRecipe({ ...recipe, [name]: value });
        }
    };

    const handleInstructionChange = (index, value) => {
        const newInstructions = [...instructions];
        newInstructions[index] = value;
        setInstructions(newInstructions);
    };

    const addInstruction = () => {
        setInstructions([...instructions, '']);
    };

    const removeInstruction = (index) => {
        if (instructions.length > 1) {
            const newInstructions = [...instructions];
            newInstructions.splice(index, 1);
            setInstructions(newInstructions);
        }
    };

    const handleGrocerySelect = (groceryId, quantity, unit, index) => {
        const updatedSelectedGroceries = [...selectedGroceries];
        if (updatedSelectedGroceries[index]) {
            updatedSelectedGroceries[index] = { groceryId, quantity, unit };
        } else {
            updatedSelectedGroceries.push({ groceryId, quantity, unit });
        }
        setSelectedGroceries(updatedSelectedGroceries);
    };

    const selectGroceryItem = (grocery) => {
        if (selectedGroceryIds.has(grocery.id)) {
            const newSelectedIds = new Set(selectedGroceryIds);
            newSelectedIds.delete(grocery.id);
            setSelectedGroceryIds(newSelectedIds);
            setSelectedGroceries(selectedGroceries.filter(item => item.groceryId !== grocery.id.toString()));
        } else {
            setSelectedGroceryIds(new Set(selectedGroceryIds).add(grocery.id));
            setSelectedGroceries([...selectedGroceries, { groceryId: grocery.id.toString(), quantity: '', unit: 'kg' }]);
        }
    };

    const toggleCategory = (category) => {
        setExpandedCategories((prev) => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(category)) {
                newExpanded.delete(category);
            } else {
                newExpanded.add(category);
            }
            return newExpanded;
        });
    };

    const removeGrocery = (index) => {
        const updatedSelectedGroceries = [...selectedGroceries];
        const groceryId = updatedSelectedGroceries[index].groceryId;

        if (groceryId) {
            const newSelectedIds = new Set(selectedGroceryIds);
            newSelectedIds.delete(parseInt(groceryId));
            setSelectedGroceryIds(newSelectedIds);
        }

        updatedSelectedGroceries.splice(index, 1);
        setSelectedGroceries(updatedSelectedGroceries);
    };

    const closeNotification = () => {
        setNotification({ show: false, message: '', type: 'success' });
    };

    const uploadRecipe = () => {
        if (!requireAuth('Please login or sign up to create recipes.')) return;
        
        const filteredInstructions = instructions.filter(instruction => instruction.trim() !== '');
        
        const groceryRequests = selectedGroceries.filter(
            (grocery) => grocery.groceryId && grocery.quantity && grocery.unit
        ).map((grocery) => ({
            groceryId: parseInt(grocery.groceryId),
            quantity: parseFloat(grocery.quantity),
            unit: grocery.unit,
        }));

        const recipeRequest = {
            recipe: {
                ...recipe,
                instructions: filteredInstructions.join('; '),
            },
            groceryRequests: groceryRequests.length > 0 ? groceryRequests : null,
            userId: userId,
        };

        fetch(`${process.env.REACT_APP_API_URL}/api/recipes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(recipeRequest),
        })
            .then((response) => {
                if (response.ok) {
                    setNotification({
                        show: true,
                        message: 'Recipe uploaded successfully!',
                        type: 'success'
                    });
                    setRecipe({ name: '', minutes: 0 });
                    setInstructions(['']);
                    setSelectedGroceries([]);
                    setSelectedGroceryIds(new Set());
                    
                    setTimeout(() => {
                        closeNotification();
                    }, 5000);
                } else {
                    setNotification({
                        show: true,
                        message: 'Failed to upload recipe.',
                        type: 'error'
                    });
                }
            })
            .catch(() => {
                setNotification({
                    show: true,
                    message: 'Error uploading recipe. Please try again.',
                    type: 'error'
                });
            });
    };

    const groupedGroceries = groceries.reduce((acc, grocery) => {
        if (!acc[grocery.category]) {
            acc[grocery.category] = [];
        }
        acc[grocery.category].push(grocery);
        return acc;
    }, {});

    return (
        <div className="min-h-screen pt-20 pb-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Notification Toast */}
                {notification.show && (
                    <div className={cn(
                        "fixed top-24 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg",
                        notification.type === 'success' 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    )}>
                        <span>{notification.message}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={closeNotification}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                
                <Card>
                    <CardHeader>
                        <CardTitle>Create Recipe</CardTitle>
                        <CardDescription>Share your favorite recipe with the community</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Basic Info */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="recipe-name">Recipe Name</Label>
                                <Input
                                    id="recipe-name"
                                    type="text"
                                    name="name"
                                    value={recipe.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter recipe name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="prep-time">Preparation Time (minutes)</Label>
                                <Input
                                    id="prep-time"
                                    type="number"
                                    name="minutes"
                                    value={recipe.minutes}
                                    onChange={handleInputChange}
                                    min="0"
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Instructions */}
                        <div className="space-y-4">
                            <Label>Instructions</Label>
                            <div className="space-y-3">
                                {instructions.map((instruction, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                            {index + 1}
                                        </div>
                                        <textarea
                                            value={instruction}
                                            onChange={(e) => handleInstructionChange(index, e.target.value)}
                                            className="flex-1 min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                            placeholder="Enter instruction step"
                                        />
                                        <Button 
                                            type="button" 
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeInstruction(index)}
                                            disabled={instructions.length === 1}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={addInstruction} className="w-full">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Step
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        {/* Select Groceries */}
                        <div className="space-y-4">
                            <Label>Select Groceries</Label>
                            <div className="space-y-3">
                                {Object.entries(groupedGroceries).map(([category, items]) => (
                                    <Card key={category} className="overflow-hidden">
                                        <div 
                                            className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => toggleCategory(category)}
                                        >
                                            <h4 className="font-medium capitalize">{category}</h4>
                                            {expandedCategories.has(category) ? (
                                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        {expandedCategories.has(category) && (
                                            <CardContent className="pt-0 pb-3">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                    {items.map(grocery => (
                                                        <div
                                                            key={grocery.id}
                                                            className={cn(
                                                                "relative flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors",
                                                                selectedGroceryIds.has(grocery.id) 
                                                                    ? "border-primary bg-primary/5" 
                                                                    : "border-border hover:border-primary/50"
                                                            )}
                                                            onClick={() => selectGroceryItem(grocery)}
                                                        >
                                                            <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                                                {grocery.imageUrl ? (
                                                                    <img src={grocery.imageUrl} alt={grocery.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                                                        No img
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-sm truncate">{grocery.name}</span>
                                                            {selectedGroceryIds.has(grocery.id) && (
                                                                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                                    <Check className="h-3 w-3 text-primary-foreground" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Selected Groceries Quantities */}
                        <div className="space-y-4">
                            <Label>Quantities for Selected Groceries</Label>
                            {selectedGroceries.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No groceries selected yet. Please select groceries from the list above.</p>
                            ) : (
                                <div className="space-y-3">
                                    {selectedGroceries.map((grocery, index) => {
                                        const groceryItem = groceries.find(item => item.id.toString() === grocery.groceryId);
                                        return (
                                            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                <div className="flex-1 min-w-0">
                                                    {groceryItem ? (
                                                        <p className="text-sm font-medium truncate">
                                                            {groceryItem.name}
                                                            <span className="text-muted-foreground ml-1">({groceryItem.category})</span>
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">Select a grocery</p>
                                                    )}
                                                </div>
                                                <Input
                                                    type="number"
                                                    placeholder="Qty"
                                                    value={grocery.quantity}
                                                    onChange={(e) =>
                                                        handleGrocerySelect(
                                                            grocery.groceryId,
                                                            e.target.value,
                                                            grocery.unit,
                                                            index
                                                        )
                                                    }
                                                    className="w-20"
                                                    min="0"
                                                    step="0.01"
                                                />
                                                <select
                                                    value={grocery.unit}
                                                    onChange={(e) =>
                                                        handleGrocerySelect(
                                                            grocery.groceryId,
                                                            grocery.quantity,
                                                            e.target.value,
                                                            index
                                                        )
                                                    }
                                                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                >
                                                    <option value="kg">kg</option>
                                                    <option value="litre">litre</option>
                                                    <option value="dozen">dozen</option>
                                                    <option value="nos">nos</option>
                                                    <option value="gram">gram</option>
                                                    <option value="millilitre">millilitre</option>
                                                    <option value="piece">piece</option>
                                                    <option value="packet">packet</option>
                                                    <option value="can">can</option>
                                                    <option value="box">box</option>
                                                    <option value="bottle">bottle</option>
                                                    <option value="bar">bar</option>
                                                    <option value="pound">pound</option>
                                                    <option value="ounce">ounce</option>
                                                    <option value="teaspoon">teaspoon</option>
                                                    <option value="tablespoon">tablespoon</option>
                                                    <option value="cup">cup</option>
                                                </select>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeGrocery(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Submit */}
                        <Button
                            type="button"
                            onClick={uploadRecipe}
                            className="w-full"
                            disabled={!recipe.name || instructions[0] === '' || selectedGroceries.length === 0}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Recipe
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default RecipeForm;