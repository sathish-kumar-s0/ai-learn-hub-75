import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
            <GraduationCap className="h-8 w-8 text-accent" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Learn Hub
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              Home
            </Link>
            <Link to="/courses" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              Courses
            </Link>
            <Link to="/about" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              About
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button variant="hero" size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
