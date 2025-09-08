import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme-context";
import { WarningSettingsProvider } from "@/contexts/warning-settings-context";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import BulkAnalysis from "@/pages/bulk-analysis";
import PerformanceBenchmarks from "@/pages/performance-benchmarks";
import AssistantStudio from "@/pages/assistant-studio";
import Reports from "@/pages/reports";
import SettingsPage from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/bulk-analysis" component={BulkAnalysis} />
      <Route path="/performance-benchmarks" component={PerformanceBenchmarks} />
      <Route path="/assistant-studio" component={AssistantStudio} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WarningSettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </WarningSettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
