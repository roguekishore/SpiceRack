import { Link } from 'react-router-dom';
import { Separator } from '../components/ui/separator';
import LogoSvg from './LogoSvg';

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity">
            <LogoSvg className="h-6 w-6" />
            <span className="font-semibold">SpiceRack</span>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Products
            </Link>
            <Link to="/recipes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Recipes
            </Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SpiceRack
          </p>
        </div>
      </div>
    </footer>
  );
}
