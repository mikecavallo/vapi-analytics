import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Brain, Wand2, Users, User, Sun, Moon, LogOut, BarChart3, Menu, Settings } from "lucide-react";
import logoTransparent from "@assets/logo_transparent_1757373755849.png";
import { useTheme } from "@/contexts/theme-context";
import { useAuth } from "@/contexts/auth-context";

export function DashboardHeader() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: null },
    { href: '/bulk-analysis', label: 'VoiceScope', icon: Brain },
    { href: '/assistant-studio', label: 'Studio', icon: Wand2 },
    { href: '/media', label: 'Media', icon: BarChart3, testId: 'link-media' },
    ...(user?.role === 'super_admin' ? [{ href: '/agency', label: 'Agency', icon: Users }] : []),
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo - Left Aligned */}
          <div className="flex-shrink-0">
            <img src={logoTransparent} alt="Invoxa.ai" className="h-8" style={{ width: 'auto' }} />
          </div>

          {/* Navigation - Center (desktop) */}
          <nav className="hidden md:flex space-x-8 mx-auto">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`pb-4 px-1 text-sm font-medium transition-colors flex items-center space-x-1 ${
                    location === link.href
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  {...(link.testId ? { 'data-testid': link.testId } : {})}
                >
                  {link.icon && <link.icon size={16} />}
                  <span>{link.label}</span>
                </span>
              </Link>
            ))}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-3 ml-auto">
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

            {/* Mobile hamburger menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden w-8 h-8 p-0">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 pt-12">
                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <span
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                          location === link.href
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {link.icon && <link.icon size={18} />}
                        <span>{link.label}</span>
                      </span>
                    </Link>
                  ))}
                  <div className="border-t border-border pt-4">
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 cursor-pointer w-full"
                    >
                      <LogOut size={18} />
                      <span>Log out</span>
                    </button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}