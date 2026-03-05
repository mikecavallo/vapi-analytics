import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import logoTransparent from "@assets/logo_transparent_1757609077252.png";

export function PublicNavbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/solutions', label: 'Solutions' },
    { href: '/use-cases', label: 'Use Cases' },
    { href: '/platform', label: 'Platform' },
    { href: '/why-invoxa', label: 'Why Invoxa' },
    { href: '/resources', label: 'Resources' },
  ];

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <img src={logoTransparent} alt="Invoxa.ai" className="h-8 cursor-pointer" />
            </Link>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">{link.label}</span>
              </Link>
            ))}
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
              <Button variant="ghost" className="hidden sm:inline-flex text-cyan-600 dark:text-cyan-300 hover:text-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/20">
                Sign In
              </Button>
            </Link>
            <Link href="/book-demo">
              <Button className="hidden sm:inline-flex bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white px-6 shadow-lg shadow-cyan-500/25">
                Book Demo
              </Button>
            </Link>

            {/* Mobile hamburger menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden w-8 h-8 p-0">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 pt-12">
                <div className="flex flex-col space-y-6">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <span
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                      >
                        {link.label}
                      </span>
                    </Link>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3">
                    <Link href="/login">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-cyan-600 dark:text-cyan-300"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/book-demo">
                      <Button
                        className="w-full bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Book Demo
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
