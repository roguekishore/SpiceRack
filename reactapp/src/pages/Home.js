import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingCart, Book, Apple, Calendar, Package, Clipboard, ArrowRight, Leaf, Sparkles, Truck, Shield, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

const quickLinks = [
  { to: '/products', label: 'Shop Now', icon: Apple },
  { to: '/recipes', label: 'Recipes', icon: Book },
  { to: '/mealplan', label: 'Meal Plan', icon: Calendar },
  { to: '/inventory', label: 'My Pantry', icon: Clipboard },
];

// Emoji mapping for categories
const categoryEmojis = {
  'fruits': '🍎',
  'vegetables': '🥬',
  'dairy': '🥛',
  'meat': '🥩',
  'seafood': '🦐',
  'bakery': '🥖',
  'beverages': '🧃',
  'snacks': '🍿',
  'frozen': '🧊',
  'pantry': '🫘',
  'condiments': '🧂',
  'spices': '🌶️',
  'grains': '🌾',
  'default': '🛒'
};

const getCategoryEmoji = (category) => {
  const lowerCategory = category?.toLowerCase() || '';
  for (const [key, emoji] of Object.entries(categoryEmojis)) {
    if (lowerCategory.includes(key)) {
      return emoji;
    }
  }
  return categoryEmojis.default;
};

const benefits = [
  { icon: Leaf, title: 'Farm Fresh', desc: 'Direct from local farms' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Same day available' },
  { icon: Shield, title: 'Quality Assured', desc: '100% satisfaction' },
  { icon: Sparkles, title: 'Best Prices', desc: 'Competitive pricing' },
];

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/groceries/all`);
      const groceries = await response.json();
      
      // Group groceries by category and count
      const categoryMap = {};
      groceries.forEach((grocery) => {
        const category = grocery.category || 'Other';
        if (!categoryMap[category]) {
          categoryMap[category] = 0;
        }
        categoryMap[category]++;
      });

      // Convert to array and sort by count
      const categoryArray = Object.entries(categoryMap)
        .map(([name, count]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          count: count,
          emoji: getCategoryEmoji(name)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6); // Show top 6 categories

      setCategories(categoryArray);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Split Layout */}
      <section className="pt-16">
        <div className="grid lg:grid-cols-2 min-h-[calc(100vh-4rem)]">
          {/* Left - Content */}
          <div className="flex flex-col justify-center px-6 md:px-12 lg:px-16 py-12 lg:py-0">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Leaf className="h-4 w-4" />
                Fresh & Organic
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                Your Kitchen,{' '}
                <span className="text-primary">Simplified</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                From fresh produce to pantry essentials, manage your groceries, discover recipes, and plan meals — all in one place.
              </p>
              <div className="flex flex-wrap gap-3 mb-12">
                <Button asChild size="lg">
                  <Link to="/products" className="inline-flex items-center gap-2">
                    Start Shopping
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/recipes">
                    Explore Recipes
                  </Link>
                </Button>
              </div>
              
              {/* Benefits Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={benefit.title} className="text-center md:text-left">
                      <Icon className="h-5 w-5 text-primary mx-auto md:mx-0 mb-1" />
                      <p className="text-sm font-medium text-foreground">{benefit.title}</p>
                      <p className="text-xs text-muted-foreground">{benefit.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Right - Visual */}
          <div className="hidden lg:flex bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 items-center justify-center p-12">
            <div className="relative w-full max-w-md">
              {/* Decorative circles */}
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-primary/15 rounded-full blur-3xl" />
              
              {/* Quick Actions Grid */}
              <div className="relative grid grid-cols-2 gap-5">
                {quickLinks.map((link, idx) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={cn(
                        "group flex flex-col items-center justify-center p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 aspect-square"
                      )}
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <span className="font-medium text-foreground text-sm">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">
                Shop by Category
              </h2>
              <p className="text-muted-foreground">
                Browse our wide selection of fresh groceries
              </p>
            </div>
            <Link 
              to="/products" 
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors self-start md:self-auto"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          {loadingCategories ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={`/products?category=${encodeURIComponent(category.name.toLowerCase())}`}
                  className="group flex flex-col items-center p-6 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                >
                  <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {category.emoji}
                  </span>
                  <span className="font-medium text-foreground text-center text-sm">
                    {category.name}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {category.count} {category.count === 1 ? 'item' : 'items'}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No categories available
            </div>
          )}
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Powerful tools to manage your kitchen and simplify meal planning
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {/* Large Featured Card */}
            <Link
              to="/recipes"
              className="group md:col-span-2 lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 md:p-10 text-primary-foreground"
            >
              <div className="relative z-10">
                <Book className="h-10 w-10 mb-4 opacity-90" />
                <h3 className="text-2xl md:text-3xl font-bold mb-2">Discover Recipes</h3>
                <p className="text-primary-foreground/80 mb-4 max-w-md">
                  Browse thousands of recipes, from quick weeknight dinners to elaborate weekend feasts.
                </p>
                <span className="inline-flex flex-row items-center gap-2 font-medium group-hover:gap-3 transition-all">
                  Explore Recipes <ArrowRight className="h-4 w-4 shrink-0" />
                </span>
              </div>
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
              <div className="absolute top-1/2 -right-4 w-24 h-24 bg-white/10 rounded-full" />
            </Link>

            {/* Meal Plan Card */}
            <Link
              to="/mealplan"
              className="group rounded-2xl bg-card border border-border/50 p-6 hover:border-primary/30 hover:shadow-md transition-all"
            >
              <Calendar className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Weekly Meal Planner</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Plan your meals and auto-generate shopping lists.
              </p>
              <span className="inline-flex flex-row items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                Plan Meals <ArrowRight className="h-3 w-3 shrink-0" />
              </span>
            </Link>

            {/* Cart Card */}
            <Link
              to="/cart"
              className="group rounded-2xl bg-card border border-border/50 p-6 hover:border-primary/30 hover:shadow-md transition-all"
            >
              <ShoppingCart className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Shopping Cart</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Review and checkout your selected items.
              </p>
              <span className="inline-flex flex-row items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                View Cart <ArrowRight className="h-3 w-3 shrink-0" />
              </span>
            </Link>

            {/* Orders Card */}
            <Link
              to="/orders"
              className="group rounded-2xl bg-card border border-border/50 p-6 hover:border-primary/30 hover:shadow-md transition-all"
            >
              <Package className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Order History</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Track and manage all your past orders.
              </p>
              <span className="inline-flex flex-row items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                View Orders <ArrowRight className="h-3 w-3 shrink-0" />
              </span>
            </Link>

            {/* Inventory Card */}
            <Link
              to="/inventory"
              className="group rounded-2xl bg-card border border-border/50 p-6 hover:border-primary/30 hover:shadow-md transition-all"
            >
              <Clipboard className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Your Inventory</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Keep track of your pantry items.
              </p>
              <span className="inline-flex flex-row items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                Manage Pantry <ArrowRight className="h-3 w-3 shrink-0" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-4">
              Ready to simplify your grocery shopping?
            </h2>
            <p className="text-muted-foreground mb-6">
              Start shopping fresh produce, plan your weekly meals, and manage your kitchen inventory.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/products" className="inline-flex items-center gap-2">
                  Browse Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">
                  Create Account
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}