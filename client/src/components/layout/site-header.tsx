import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
import logoTransparent from "@assets/logo_transparent_1757609077252.png";
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';

export function SiteHeader() {
  const { user, isAuthenticated, isSuperAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Clickable to go home */}
          <div className="flex items-center space-x-3">
            <Link href="/" data-testid="link-home-logo">
              <img 
                src={logoTransparent} 
                alt="Invoxa.ai" 
                className="h-8 cursor-pointer hover:opacity-80 transition-opacity" 
              />
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {!isAuthenticated ? (
              // Non-authenticated navigation
              <>
                <Link href="/solutions" data-testid="link-solutions">
                  <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Solutions</span>
                </Link>
                <Link href="/platform" data-testid="link-platform">
                  <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Platform</span>
                </Link>
                <Link href="/why-invoxa" data-testid="link-why-invoxa">
                  <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Why Invoxa</span>
                </Link>
                <Link href="/resources" data-testid="link-resources">
                  <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Resources</span>
                </Link>
              </>
            ) : (
              // Authenticated navigation
              <>
                <Link href="/dashboard" data-testid="link-dashboard">
                  <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Dashboard</span>
                </Link>
                <Link href="/voicescope" data-testid="link-voicescope">
                  <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">VoiceScope</span>
                </Link>
                <Link href="/assistant-studio" data-testid="link-studio">
                  <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Studio</span>
                </Link>
                {isSuperAdmin && (
                  <Link href="/agency" data-testid="link-agency">
                    <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Agency</span>
                  </Link>
                )}
                <Link href="/settings" data-testid="link-settings">
                  <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Settings</span>
                </Link>
              </>
            )}
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {!isAuthenticated ? (
              // Non-authenticated actions
              <>
                <Link href="/login" data-testid="link-login">
                  <Button variant="ghost" className="text-cyan-600 dark:text-cyan-300 hover:text-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/20">
                    Sign In
                  </Button>
                </Link>
                <Link href="/book-demo" data-testid="link-book-demo">
                  <Button className="bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white px-6 shadow-lg shadow-cyan-500/25">
                    Book Demo
                  </Button>
                </Link>
              </>
            ) : (
              // Authenticated actions - Profile dropdown
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-profile-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-600 text-white text-sm">
                        {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm" data-testid="text-user-name">
                        {user?.username}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid="text-user-email">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} data-testid="button-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}