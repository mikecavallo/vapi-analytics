import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme-context";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import BulkAnalysis from "@/pages/bulk-analysis";
import PerformanceBenchmarks from "@/pages/performance-benchmarks";
import AssistantStudio from "@/pages/assistant-studio";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/bulk-analysis" component={BulkAnalysis} />
      <Route path="/performance-benchmarks" component={PerformanceBenchmarks} />
      <Route path="/assistant-studio" component={AssistantStudio} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
