import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval } from 'date-fns';
import { parseISO } from 'date-fns';
import { UserContext } from '../context/UserContext';
import '../css/MealPlan.css'

const MealPlanTable = () => {
  const { user } = useContext(UserContext);
  const [recipes, setRecipes] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [currentWeekEnd, setCurrentWeekEnd] = useState(endOfWeek(new Date()));

  useEffect(() => {
    fetchRecipes();
    fetchMealPlans();
  }, [currentWeekStart, currentWeekEnd, user.id]);

  const fetchRecipes = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/recipes`);
      setRecipes(response.data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const fetchMealPlans = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/mealplans/range`, {
        params: {
          userId: user.id,
          startDate: format(currentWeekStart, 'yyyy-MM-dd'),
          endDate: format(currentWeekEnd, 'yyyy-MM-dd'),
        },
      });
      setMealPlans(response.data);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
    }
  };

  const handleRecipeChange = async (day, time, recipeId) => {
    const date = format(day, 'yyyy-MM-dd');
    const existingMealPlan = mealPlans.find(
      (plan) => format(plan.date, 'yyyy-MM-dd') === date
    );

    const mealPlanData = {
      userId: user.id,
      date: date,
      breakfastRecipeId: time === 'breakfast' ? recipeId : existingMealPlan?.breakfastRecipeId,
      lunchRecipeId: time === 'lunch' ? recipeId : existingMealPlan?.lunchRecipeId,
      dinnerRecipeId: time === 'dinner' ? recipeId : existingMealPlan?.dinnerRecipeId,
    };

    try {
      if (existingMealPlan) {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/mealplans`, mealPlanData);
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/mealplans`, mealPlanData);
      }
      fetchMealPlans();
    } catch (error) {
      console.error('Error saving meal plan:', error);
    }
  };

  const getRecipeName = (recipeId) => {
    const recipe = recipes.find((r) => r.id === recipeId);
    return recipe ? recipe.name : '';
  };

  const getMealPlanForDay = (day, time) => {
    const date = format(day, 'yyyy-MM-dd');
    const mealPlan = mealPlans.find((plan) => format(plan.date, 'yyyy-MM-dd') === date);
    if (!mealPlan) return null;

    if (time === 'breakfast') return mealPlan.breakfastRecipeId;
    if (time === 'lunch') return mealPlan.lunchRecipeId;
    if (time === 'dinner') return mealPlan.dinnerRecipeId;
    return null;
  };

  const daysOfWeek = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });

  const navigateWeek = (direction) => {
    if (direction === 'next') {
      setCurrentWeekStart(addWeeks(currentWeekStart, 1));
      setCurrentWeekEnd(addWeeks(currentWeekEnd, 1));
    } else {
      setCurrentWeekStart(subWeeks(currentWeekStart, 1));
      setCurrentWeekEnd(subWeeks(currentWeekEnd, 1));
    }
  };

  return (
    <div className='mp-container'>
    <div className="meal-plan-container">
      <div className="meal-plan-header">
        <h2 className="meal-plan-title">Weekly Meal Planner</h2>
        <div className="week-navigation">
          <button className="nav-button" onClick={() => navigateWeek('prev')}>
            Previous Week
          </button>
          <button className="nav-button" onClick={() => navigateWeek('next')}>
            Next Week
          </button>
        </div>
      </div>
      <table className="meal-plan-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Breakfast</th>
            <th>Lunch</th>
            <th>Dinner</th>
          </tr>
        </thead>
        <tbody>
  {daysOfWeek.map((day) => (
    <tr key={format(day, 'yyyy-MM-dd')}>
      <td className="day-cell" data-label="Day">{format(day, 'EEEE, MMM dd')}</td>
      <td data-label="Breakfast">
        <select
          className="recipe-select"
          value={getMealPlanForDay(day, 'breakfast') || ''}
          onChange={(e) => handleRecipeChange(day, 'breakfast', parseInt(e.target.value))}
        >
          <option value="">Select Recipe</option>
          {recipes.map((recipe) => (
            <option key={recipe.id} value={recipe.id}>
              {recipe.name}
            </option>
          ))}
        </select>
      </td>
      <td data-label="Lunch">
        <select
          className="recipe-select"
          value={getMealPlanForDay(day, 'lunch') || ''}
          onChange={(e) => handleRecipeChange(day, 'lunch', parseInt(e.target.value))}
        >
          <option value="">Select Recipe</option>
          {recipes.map((recipe) => (
            <option key={recipe.id} value={recipe.id}>
              {recipe.name}
            </option>
          ))}
        </select>
      </td>
      <td data-label="Dinner">
        <select
          className="recipe-select"
          value={getMealPlanForDay(day, 'dinner') || ''}
          onChange={(e) => handleRecipeChange(day, 'dinner', parseInt(e.target.value))}
        >
          <option value="">Select Recipe</option>
          {recipes.map((recipe) => (
            <option key={recipe.id} value={recipe.id}>
              {recipe.name}
            </option>
          ))}
        </select>
      </td>
    </tr>
  ))}
</tbody>

      </table>
    </div>
    </div>
  );
};

export default MealPlanTable;