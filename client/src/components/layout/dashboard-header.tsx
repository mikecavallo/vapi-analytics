import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Brain, Wand2, Users, User, Sun, Moon, LogOut } from "lucide-react";
import logoTransparent from "@assets/logo_transparent_1757373755849.png";
import { useTheme } from "@/contexts/theme-context";
import { useAuth } from "@/contexts/auth-context";

export function DashboardHeader() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo - Left Aligned */}
          <div className="flex-shrink-0">
            <img src={logoTransparent} alt="Invoxa.ai" className="h-8" style={{ width: 'auto' }} />
          </div>
          
          {/* Navigation - Center */}
          <nav className="hidden md:flex space-x-8 mx-auto">
            <Link href="/dashboard">
              <span className={`pb-4 px-1 text-sm font-medium transition-colors ${
                location === '/dashboard' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
                Dashboard
              </span>
            </Link>
            <Link href="/bulk-analysis">
              <span className={`pb-4 px-1 text-sm font-medium transition-colors flex items-center space-x-1 ${
                location === '/bulk-analysis' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
                <Brain size={16} />
                <span>VoiceScope</span>
              </span>
            </Link>
            <Link href="/assistant-studio">
              <span className={`pb-4 px-1 text-sm font-medium transition-colors flex items-center space-x-1 ${
                location === '/assistant-studio' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
                <Wand2 size={16} />
                <span>Studio</span>
              </span>
            </Link>
            {user?.role === 'super_admin' && (
              <Link href="/agency">
                <span className={`pb-4 px-1 text-sm font-medium transition-colors flex items-center space-x-1 ${
                  location === '/agency' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}>
                  <Users size={16} />
                  <span>Agency</span>
                </span>
              </Link>
            )}
            <Link href="/settings">
              <span className={`pb-4 px-1 text-sm font-medium transition-colors ${
                location === '/settings' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
                Settings
              </span>
            </Link>
          </nav>
          
          {/* Right side controls */}
          <div className="flex items-center space-x-4 ml-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full p-0"
              data-testid="button-toggle-theme"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="w-8 h-8 rounded-full p-0" data-testid="button-user">
                  <User size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={logout} className="cursor-pointer" data-testid="menu-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}