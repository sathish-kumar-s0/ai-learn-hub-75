import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();

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
            {user && (
              <Link to="/my-courses" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
                My Courses
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                          <LayoutDashboard className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
