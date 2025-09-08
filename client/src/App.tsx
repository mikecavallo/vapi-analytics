import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme-context";
import { WarningSettingsProvider } from "@/contexts/warning-settings-context";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import BulkAnalysis from "@/pages/bulk-analysis";
import PerformanceBenchmarks from "@/pages/performance-benchmarks";
import AssistantStudio from "@/pages/assistant-studio";
import SettingsPage from "@/pages/settings";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import VerifyEmailPage from "@/pages/verify-email";
import { useEffect } from "react";

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect unauthenticated users to login, but allow public routes
  useEffect(() => {
    if (!isLoading && !isAuthenticated && 
        !location.startsWith('/login') && 
        !location.startsWith('/signup') && 
        !location.startsWith('/verify-email')) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  return (
    <Switch>
      {/* Public authentication routes */}
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/verify-email" component={VerifyEmailPage} />
      
      {/* Protected dashboard routes */}
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
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
      <Route path="/performance-benchmarks">
        <ProtectedRoute>
          <PerformanceBenchmarks />
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
      
      <Route component={NotFound} />
    </Switch>
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
