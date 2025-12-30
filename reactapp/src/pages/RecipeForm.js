import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import '../css/RecipeForm.css';

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
    const [notification, setNotification] = useState({ show: false, message: '' });
    const { user } = useContext(UserContext);
    const userId = user.id;

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

    const addGrocery = () => {
        setSelectedGroceries([...selectedGroceries, { groceryId: '', quantity: '', unit: 'kg' }]);
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
        setNotification({ show: false, message: '' });
    };

    const uploadRecipe = () => {
        // Filter out empty instructions
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
                instructions: filteredInstructions.join('; '), // Convert array to semicolon-delimited string
            },
            groceryRequests: groceryRequests.length > 0 ? groceryRequests : null,
            userId: userId,
        };

        //console.log(recipeRequest);

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
                        message: 'Recipe uploaded successfully!'
                    });
                    // Reset form
                    setRecipe({ name: '', minutes: 0 });
                    setInstructions(['']);
                    setSelectedGroceries([]);
                    setSelectedGroceryIds(new Set());
                    
                    // Auto-hide notification after 5 seconds
                    setTimeout(() => {
                        closeNotification();
                    }, 5000);
                } else {
                    setNotification({
                        show: true,
                        message: 'Failed to upload recipe.'
                    });
                }
            })
            .catch(() => {
                setNotification({
                    show: true,
                    message: 'Error uploading recipe. Please try again.'
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
        <div className="recipe-form-container">
            {notification.show && (
                <div className="notification-toast">
                    <span>{notification.message}</span>
                    <button className="close-notification" onClick={closeNotification}>×</button>
                </div>
            )}
            
            <div className="recipe-form-wrapper">
                <h1 className="form-title">Create Recipe</h1>

                <div className="form-section">
                    <div className="form-group">
                        <label htmlFor="recipe-name" className="form-label">Recipe Name</label>
                        <input
                            id="recipe-name"
                            type="text"
                            name="name"
                            value={recipe.name}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Enter recipe name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="prep-time" className="form-label">Preparation Time (minutes)</label>
                        <input
                            id="prep-time"
                            type="number"
                            name="minutes"
                            value={recipe.minutes}
                            onChange={handleInputChange}
                            className="form-input"
                            min="0"
                        />
                    </div>
                </div>

                <div className="form-section">
                    <label className="form-label">Instructions</label>
                    <div className="instructions-container">
                        {instructions.map((instruction, index) => (
                            <div key={index} className="instruction-step">
                                <div className="step-number">{index + 1}</div>
                                <textarea
                                    value={instruction}
                                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                                    className="form-input instruction-input"
                                    placeholder="Enter instruction step"
                                    rows={Math.max(1, Math.ceil(instruction.length / 50))}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => removeInstruction(index)} 
                                    className="btn btn-icon remove-step"
                                    disabled={instructions.length === 1}
                                >
                                    -
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addInstruction} className="btn btn-add-step">
                            + Add Step
                        </button>
                    </div>
                </div>

                <div className="form-section">
                    <h2 className="section-title">Select Groceries</h2>

                    <div className="grocery-grid-container">
                        {Object.entries(groupedGroceries).map(([category, items]) => (
                            <div key={category} className="grocery-category">
                                <div className="category-header">
                                    <h3 className="category-title">{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                                    <button
                                        className="category-toggle"
                                        onClick={() => toggleCategory(category)}
                                    >
                                        {expandedCategories.has(category) ? '-' : '+'}
                                    </button>
                                </div>
                                {expandedCategories.has(category) && (
                                    <div className="grocery-grid">
                                        {items.map(grocery => (
                                            <div
                                                key={grocery.id}
                                                className={`grocery-item ${selectedGroceryIds.has(grocery.id) ? 'selected' : ''}`}
                                                onClick={() => selectGroceryItem(grocery)}
                                            >
                                                <div className="grocery-image">
                                                    {grocery.imageUrl ? (
                                                        <img src={grocery.imageUrl} alt={grocery.name} />
                                                    ) : (
                                                        <div className="no-image">No Image</div>
                                                    )}
                                                </div>
                                                <div className="grocery-details">
                                                    <span className="grocery-name">{grocery.name}</span>
                                                    <span className="grocery-category">{grocery.category}</span>
                                                </div>
                                                {selectedGroceryIds.has(grocery.id) && (
                                                    <div className="grocery-selected-indicator">✓</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-section">
                    <h2 className="section-title">Quantities for Selected Groceries</h2>

                    {selectedGroceries.length === 0 ? (
                        <p className="no-items-message">No groceries selected yet. Please select groceries from the list above.</p>
                    ) : (
                        <div className="selected-groceries">
                            {selectedGroceries.map((grocery, index) => {
                                const groceryItem = groceries.find(item => item.id.toString() === grocery.groceryId);
                                return (
                                    <div key={index} className="selected-grocery-row">
                                        <div className="selected-grocery-info">
                                            {groceryItem ? (
                                                <>
                                                    <span className="selected-grocery-name">{groceryItem.name}</span>
                                                    <span className="selected-grocery-category">({groceryItem.category})</span>
                                                </>
                                            ) : (
                                                <span className="selected-grocery-placeholder">Select a grocery</span>
                                            )}
                                        </div>

                                        <div className="quantity-controls">
                                            <input
                                                type="number"
                                                placeholder="Quantity"
                                                value={grocery.quantity}
                                                onChange={(e) =>
                                                    handleGrocerySelect(
                                                        grocery.groceryId,
                                                        e.target.value,
                                                        grocery.unit,
                                                        index
                                                    )
                                                }
                                                className="form-input quantity-input"
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
                                                className="form-select"
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

                                            <button
                                                type="button"
                                                onClick={() => removeGrocery(index)}
                                                className="btn btn-icon"
                                                title="Remove grocery"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={uploadRecipe}
                        className="btn btn-primary"
                        disabled={!recipe.name || instructions[0] === '' || selectedGroceries.length === 0}
                    >
                        Upload Recipe
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RecipeForm;