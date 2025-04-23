import { NavLink } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import LogoSvg from './LogoSvg';
import '../css/Navbar.css';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);

  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    function handleOutsideClick(e) {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        !hamburgerRef.current.contains(e.target)
      ) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu when screen resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen]);

  return (
    <nav className={`nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-content">
          <NavLink to="/home" className="nav-title">
            <div className='logo-container'>
              <LogoSvg />
            </div>
            SpiceRack
          </NavLink>
          
          {/* Hamburger Menu Button */}
          <button 
            className={`hamburger-menu ${mobileMenuOpen ? 'open' : ''}`} 
            onClick={toggleMobileMenu}
            ref={hamburgerRef}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          {/* Desktop Navigation */}
          <ul className="nav-desktop">
            <li className="nav-li"><NavLink to="/home">Home</NavLink></li>
            <li className="nav-li"><NavLink to="/products">Products</NavLink></li>
            <li className="nav-li"><NavLink to="/orders">Orders</NavLink></li>
            <li className="nav-li"><NavLink to="/inventory">Inventory</NavLink></li>
            <li className="nav-li"><NavLink to="/cart">Cart</NavLink></li>
            <li className="nav-li"><NavLink to="/recipes">Recipes</NavLink></li>
            <li className="nav-li"><NavLink to="/mealplan">MealPlan</NavLink></li>
            <li className="nav-li"><NavLink to="/profile">Profile</NavLink></li>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </ul>
          
          {/* Mobile Navigation */}
          <div className={`mobile-menu-container ${mobileMenuOpen ? 'open' : ''}`} ref={mobileMenuRef}>
            <ul className="mobile-menu">
              <li className="nav-li"><NavLink to="/home" onClick={toggleMobileMenu}>Home</NavLink></li>
              <li className="nav-li"><NavLink to="/products" onClick={toggleMobileMenu}>Products</NavLink></li>
              <li className="nav-li"><NavLink to="/orders" onClick={toggleMobileMenu}>Orders</NavLink></li>
              <li className="nav-li"><NavLink to="/inventory" onClick={toggleMobileMenu}>Inventory</NavLink></li>
              <li className="nav-li"><NavLink to="/cart" onClick={toggleMobileMenu}>Cart</NavLink></li>
              <li className="nav-li"><NavLink to="/recipes" onClick={toggleMobileMenu}>Recipes</NavLink></li>
              <li className="nav-li"><NavLink to="/mealplan" onClick={toggleMobileMenu}>MealPlan</NavLink></li>
              <li className="nav-li"><NavLink to="/profile" onClick={toggleMobileMenu}>Profile</NavLink></li>
              <li><button className="logout-button" onClick={handleLogout}>Logout</button></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}