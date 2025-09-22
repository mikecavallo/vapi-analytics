import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-black border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black dark:text-white">Invoxa.ai</h3>
            <p className="text-sm text-muted-foreground">
              Transform your voice AI data into actionable insights with advanced analytics and real-time monitoring.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-black dark:text-white">Platform</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-dashboard">
                Dashboard
              </Link>
              <Link href="/bulk-analysis" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-voicescope">
                VoiceScope AI
              </Link>
              <Link href="/assistant-studio" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-assistant-studio">
                Assistant Studio
              </Link>
              <Link href="/agency" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-agency">
                Agency Dashboard
              </Link>
            </nav>
          </div>


          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-black dark:text-white">Company</h4>
            <nav className="flex flex-col space-y-2">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-about">
                About
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-privacy">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-terms">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-contact">
                Contact
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-muted-foreground" data-testid="text-copyright">
              © {new Date().getFullYear()} Invoxa.ai. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <span className="text-xs text-muted-foreground">
                Powered by advanced voice AI analytics
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}