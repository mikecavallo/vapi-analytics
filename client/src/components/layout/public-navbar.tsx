import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import logoTransparent from "@assets/logo_transparent_1757609077252.png";

export function PublicNavbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <img src={logoTransparent} alt="Invoxa.ai" className="h-8 cursor-pointer" />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/solutions">
              <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Solutions</span>
            </Link>
            <Link href="/use-cases">
              <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Use Cases</span>
            </Link>
            <Link href="/platform">
              <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Platform</span>
            </Link>
            <Link href="/why-invoxa">
              <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Why Invoxa</span>
            </Link>
            <Link href="/resources">
              <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Resources</span>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full p-0"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </Button>
            <Link href="/login">
              <Button variant="ghost" className="text-cyan-600 dark:text-cyan-300 hover:text-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/20">
                Sign In
              </Button>
            </Link>
            <Link href="/book-demo">
              <Button className="bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white px-6 shadow-lg shadow-cyan-500/25">
                Book Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
