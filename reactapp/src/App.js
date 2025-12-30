import React from 'react';
import { Routes, Route, useLocation, BrowserRouter } from 'react-router-dom';
import Orders from './pages/Orders';
import './App.css';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Product from './pages/Product';
import Navbar from './pages/Navbar';
import Home from './pages/Home';
import Footer from './pages/Footer';
import Profile from './pages/UserDetails';
import InventoryDisplay from './pages/Inventory';
import RecipeForm from './pages/RecipeForm';
import RecipeList from './pages/RecipeList';
import UserRecipes from './pages/UserRecipes';
import MealPlanTable from './pages/MealPlan';
import GroceryUpload from './pages/GroceryUpload';
import { UserProvider } from './context/UserContext';

function Main() {
    const location = useLocation();
    const isLoginPage = location.pathname === '/';

    return (
        <main className="main">
            {!isLoginPage && <Navbar />}
            <div className={isLoginPage ? '' : 'app-container'}>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/products" element={<Product />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/inventory" element={<InventoryDisplay />} />
                    <Route path="/recipes" element={<RecipeList />} />
                    <Route path="/recipeform" element={<RecipeForm />} />
                    <Route path="/userrecipes" element={<UserRecipes />} />
                    <Route path="/mealplan" element={<MealPlanTable />} />
                    <Route path="/groceryupload" element={<GroceryUpload />} />
                </Routes>
            </div>
            {/* {!isLoginPage && <Footer />} */}
        </main>
    );
}

export default function App() {
    return (
        <UserProvider>
            <BrowserRouter>
                <Main />
            </BrowserRouter>
        </UserProvider>
    );
}