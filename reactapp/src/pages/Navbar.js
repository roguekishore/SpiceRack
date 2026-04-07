import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useContext } from 'react';
import { UserContext } from "../context/UserContext";
import { Menu, X, Home, ShoppingBag, ClipboardList, Package, ShoppingCart, BookOpen, Calendar, User } from 'lucide-react';
import LogoSvg from './LogoSvg';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/theme-toggle';
import { Sheet, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { Separator } from '../components/ui/separator';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/products', label: 'Products', icon: ShoppingBag },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/cart', label: 'Cart', icon: ShoppingCart },
  { to: '/recipes', label: 'Recipes', icon: BookOpen },
  { to: '/mealplan', label: 'MealPlan', icon: Calendar },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);

  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/home");
    setMobileMenuOpen(false);
  };

  const handleLogin = () => {
    navigate("/login");
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    function handleOutsideClick(e) {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target)
      ) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
      isScrolled 
        ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b" 
        : "bg-background"
    )}>
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/home" className="flex items-center gap-2 font-semibold text-lg">
          <LogoSvg className="w-6 h-6" />
          <span>SpiceRack</span>
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button onClick={handleLogin}>
              Login
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            ref={hamburgerRef}
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <div ref={mobileMenuRef}>
          <SheetHeader className="px-6 pt-2">
            <SheetTitle className="flex items-center gap-2">
              <LogoSvg className="w-6 h-6" />
              SpiceRack
            </SheetTitle>
          </SheetHeader>
          <Separator className="my-4" />
          <div className="flex flex-col gap-1 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
          <Separator className="my-4" />
          <div className="px-4 pb-4">
            {user ? (
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <Button className="w-full" onClick={handleLogin}>
                Login
              </Button>
            )}
          </div>
        </div>
      </Sheet>
    </header>
  );
}