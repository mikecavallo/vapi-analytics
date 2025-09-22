import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme-context";
import { WarningSettingsProvider } from "@/contexts/warning-settings-context";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Footer } from "@/components/layout/footer";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import BulkAnalysis from "@/pages/bulk-analysis";
import AssistantStudio from "@/pages/assistant-studio";
import SettingsPage from "@/pages/settings";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import VerifyEmailPage from "@/pages/verify-email";
import AgencyPage from "@/pages/agency";
import LandingPage from "@/pages/landing";
import SolutionsPage from "@/pages/solutions";
import UseCasesPage from "@/pages/use-cases";
import PlatformPage from "@/pages/platform";
import WhyInvoxaPage from "@/pages/why-invoxa";
import ResourcesPage from "@/pages/resources";
import BookDemoPage from "@/pages/book-demo";
import { useEffect } from "react";

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect unauthenticated users to landing page, but allow public routes
  useEffect(() => {
    const publicRoutes = [
      '/', '/login', '/signup', '/verify-email',
      '/solutions', '/use-cases', '/platform', '/why-invoxa', '/resources', '/book-demo'
    ];
    
    const isPublicRoute = publicRoutes.some(route => 
      location === route || location.startsWith(route + '/')
    );
    
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      setLocation('/');
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 min-h-0">
        <Switch>
          {/* Public routes */}
          <Route path="/" component={LandingPage} />
          <Route path="/solutions" component={SolutionsPage} />
          <Route path="/use-cases" component={UseCasesPage} />
          <Route path="/platform" component={PlatformPage} />
          <Route path="/why-invoxa" component={WhyInvoxaPage} />
          <Route path="/resources" component={ResourcesPage} />
          <Route path="/book-demo" component={BookDemoPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/signup" component={SignupPage} />
          <Route path="/verify-email" component={VerifyEmailPage} />
          
          {/* Protected dashboard routes */}
          <Route path="/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/bulk-analysis">
            <ProtectedRoute>
              <BulkAnalysis />
            </ProtectedRoute>
          </Route>
          <Route path="/studio">
            <ProtectedRoute>
              <AssistantStudio />
            </ProtectedRoute>
          </Route>
          <Route path="/assistant-studio">
            <ProtectedRoute>
              <AssistantStudio />
            </ProtectedRoute>
          </Route>
          <Route path="/settings">
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          </Route>
          <Route path="/agency">
            <ProtectedRoute>
              <AgencyPage />
            </ProtectedRoute>
          </Route>
          
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <WarningSettingsProvider>
            <TooltipProvider>
              <Toaster />
              <AppRouter />
            </TooltipProvider>
          </WarningSettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
