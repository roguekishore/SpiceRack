import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';

const MealPlanTable = () => {
  const { user, requireAuth } = useContext(UserContext);
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [currentWeekEnd, setCurrentWeekEnd] = useState(endOfWeek(new Date()));

  useEffect(() => {
    fetchRecipes();
    if (user?.id) {
      fetchMealPlans();
    }
  }, [currentWeekStart, currentWeekEnd, user?.id]);

  const fetchRecipes = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/recipes`);
      setRecipes(response.data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const fetchMealPlans = async () => {
    if (!user?.id) return;
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
    if (!requireAuth('Please login or sign up to create meal plans.')) return;
    
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
      await axios.post(`${process.env.REACT_APP_API_URL}/api/mealplans`, mealPlanData);
      fetchMealPlans();
    } catch (error) {
      console.error('Error saving meal plan:', error);
    }
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
    <div className="min-h-screen pt-20 pb-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Weekly Meal Planner</h1>
          <p className="text-muted-foreground">Plan your meals for the week</p>
        </div>

        {!user && (
          <Card className="mb-8">
            <CardContent className="py-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">Please login to create and save your meal plans.</p>
              <Button onClick={() => navigate('/login')}>
                Login / Sign Up
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous Week
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            {format(currentWeekStart, 'MMM d')} - {format(currentWeekEnd, 'MMM d, yyyy')}
          </span>
          <Button variant="outline" onClick={() => navigateWeek('next')}>
            Next Week
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Meal Plan Grid */}
        <div className="space-y-4">
          {/* Header Row - Desktop */}
          <div className="hidden md:grid md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="font-semibold">Day</div>
            <div className="font-semibold">Breakfast</div>
            <div className="font-semibold">Lunch</div>
            <div className="font-semibold">Dinner</div>
          </div>

          {/* Day Rows */}
          {daysOfWeek.map((day) => (
            <Card key={format(day, 'yyyy-MM-dd')}>
              <CardContent className="p-4">
                <div className="grid md:grid-cols-4 gap-4">
                  {/* Day Label */}
                  <div className="font-medium md:flex md:items-center">
                    <div>
                      <span className="block">{format(day, 'EEEE')}</span>
                      <span className="text-sm text-muted-foreground">{format(day, 'MMM d')}</span>
                    </div>
                  </div>

                  {/* Breakfast */}
                  <div className="space-y-1">
                    <Label className="md:hidden text-muted-foreground">Breakfast</Label>
                    <select
                      value={getMealPlanForDay(day, 'breakfast') || ''}
                      onChange={(e) => handleRecipeChange(day, 'breakfast', parseInt(e.target.value))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select Recipe</option>
                      {recipes.map((recipe) => (
                        <option key={recipe.id} value={recipe.id}>
                          {recipe.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Lunch */}
                  <div className="space-y-1">
                    <Label className="md:hidden text-muted-foreground">Lunch</Label>
                    <select
                      value={getMealPlanForDay(day, 'lunch') || ''}
                      onChange={(e) => handleRecipeChange(day, 'lunch', parseInt(e.target.value))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select Recipe</option>
                      {recipes.map((recipe) => (
                        <option key={recipe.id} value={recipe.id}>
                          {recipe.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dinner */}
                  <div className="space-y-1">
                    <Label className="md:hidden text-muted-foreground">Dinner</Label>
                    <select
                      value={getMealPlanForDay(day, 'dinner') || ''}
                      onChange={(e) => handleRecipeChange(day, 'dinner', parseInt(e.target.value))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select Recipe</option>
                      {recipes.map((recipe) => (
                        <option key={recipe.id} value={recipe.id}>
                          {recipe.name}
                        </option>
                      ))}
                    </select>
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

export default MealPlanTable;