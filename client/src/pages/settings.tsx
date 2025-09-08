import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWarningSettings } from "@/contexts/warning-settings-context";
import { defaultWarningSettings, warningDescriptions, WarningSettings } from "@shared/warning-settings";
import { Settings, AlertTriangle, RotateCcw, Save, User, Sun, Moon, ChartLine, Brain, Activity, Wand2, FileText } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/contexts/theme-context";

/**
 * Settings Page Component
 * Comprehensive settings interface for warning thresholds and system configuration
 */
export default function SettingsPage() {
  const { settings, updateSettings, resetToDefaults, isLoading } = useWarningSettings();
  const [localSettings, setLocalSettings] = useState<WarningSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();

  // Update local settings when context settings change
  useState(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  });

  const handleSettingsChange = (newSettings: WarningSettings) => {
    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      updateSettings(localSettings);
      setHasChanges(false);
      toast({
        title: "Settings Saved",
        description: "Warning settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setLocalSettings(defaultWarningSettings);
    setHasChanges(true);
    toast({
      title: "Reset to Defaults",
      description: "Settings have been reset. Click Save to apply changes.",
    });
  };

  const updateNestedSetting = (path: string[], value: any) => {
    const newSettings = { ...localSettings };
    let current = newSettings as any;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    
    handleSettingsChange(newSettings);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary flex items-center">
                  <ChartLine className="mr-2" size={24} />
                  Vapi Analytics
                </h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors">
                  Dashboard
                </Link>
                <Link href="/bulk-analysis" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors flex items-center space-x-1">
                  <Brain size={16} />
                  <span>VoiceScope</span>
                </Link>
                <Link href="/performance-benchmarks" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors flex items-center space-x-1">
                  <Activity size={16} />
                  <span>Benchmarks</span>
                </Link>
                <Link href="/assistant-studio" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors flex items-center space-x-1">
                  <Wand2 size={16} />
                  <span>Studio</span>
                </Link>
                <Link href="/settings" className="text-primary border-b-2 border-primary pb-4 px-1 text-sm font-medium">
                  Settings
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleTheme}
                className="w-8 h-8 rounded-full p-0"
                data-testid="button-toggle-theme"
              >
                {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
              </Button>
              <div className="relative">
                <Button variant="secondary" size="sm" className="w-8 h-8 rounded-full p-0" data-testid="button-user">
                  <User size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="text-primary" size={28} />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-1">Configure warning thresholds and system alerts</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {hasChanges && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                  Unsaved Changes
                </Badge>
              )}
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                data-testid="button-reset-defaults"
              >
                <RotateCcw size={16} />
                <span>Reset to Defaults</span>
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex items-center space-x-2"
                data-testid="button-save-settings"
              >
                <Save size={16} />
                <span>Save Changes</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Warning Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="text-amber-500" size={20} />
              <span>Warning Configuration</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Customize thresholds and alert levels for system warnings. Changes apply immediately after saving.
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* Success Rate Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Success Rate Alerts</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Critical Success Rate */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="success-critical">Critical Threshold (%)</Label>
                    <Badge variant="destructive">Default: 70%</Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={localSettings.successRate.critical.enabled}
                      onCheckedChange={(enabled) => 
                        updateNestedSetting(['successRate', 'critical', 'enabled'], enabled)
                      }
                      data-testid="switch-success-critical"
                    />
                    <Input
                      id="success-critical"
                      type="number"
                      min="0"
                      max="100"
                      value={localSettings.successRate.critical.threshold}
                      onChange={(e) => 
                        updateNestedSetting(['successRate', 'critical', 'threshold'], Number(e.target.value))
                      }
                      disabled={!localSettings.successRate.critical.enabled}
                      className="w-24"
                      data-testid="input-success-critical"
                    />
                    <Select
                      value={localSettings.successRate.critical.level}
                      onValueChange={(level) => 
                        updateNestedSetting(['successRate', 'critical', 'level'], level)
                      }
                      disabled={!localSettings.successRate.critical.enabled}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {warningDescriptions.successRate.critical}
                  </p>
                </div>

                {/* Warning Success Rate */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="success-warning">Warning Threshold (%)</Label>
                    <Badge variant="secondary">Default: 85%</Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={localSettings.successRate.warning.enabled}
                      onCheckedChange={(enabled) => 
                        updateNestedSetting(['successRate', 'warning', 'enabled'], enabled)
                      }
                      data-testid="switch-success-warning"
                    />
                    <Input
                      id="success-warning"
                      type="number"
                      min="0"
                      max="100"
                      value={localSettings.successRate.warning.threshold}
                      onChange={(e) => 
                        updateNestedSetting(['successRate', 'warning', 'threshold'], Number(e.target.value))
                      }
                      disabled={!localSettings.successRate.warning.enabled}
                      className="w-24"
                      data-testid="input-success-warning"
                    />
                    <Select
                      value={localSettings.successRate.warning.level}
                      onValueChange={(level) => 
                        updateNestedSetting(['successRate', 'warning', 'level'], level)
                      }
                      disabled={!localSettings.successRate.warning.enabled}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {warningDescriptions.successRate.warning}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Cost Per Call Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Cost Monitoring</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cost-warning">Cost Per Call Warning ($)</Label>
                    <Badge variant="secondary">Default: $2.00</Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={localSettings.costPerCall.warning.enabled}
                      onCheckedChange={(enabled) => 
                        updateNestedSetting(['costPerCall', 'warning', 'enabled'], enabled)
                      }
                      data-testid="switch-cost-warning"
                    />
                    <Input
                      id="cost-warning"
                      type="number"
                      min="0"
                      step="0.01"
                      value={localSettings.costPerCall.warning.threshold}
                      onChange={(e) => 
                        updateNestedSetting(['costPerCall', 'warning', 'threshold'], Number(e.target.value))
                      }
                      disabled={!localSettings.costPerCall.warning.enabled}
                      className="w-24"
                      data-testid="input-cost-warning"
                    />
                    <Select
                      value={localSettings.costPerCall.warning.level}
                      onValueChange={(level) => 
                        updateNestedSetting(['costPerCall', 'warning', 'level'], level)
                      }
                      disabled={!localSettings.costPerCall.warning.enabled}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {warningDescriptions.costPerCall.warning}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Call Duration Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Call Duration Alerts</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Short Calls */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="duration-short">Short Calls Alert (seconds)</Label>
                    <Badge variant="secondary">Default: 30s</Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={localSettings.callDuration.shortCalls.enabled}
                      onCheckedChange={(enabled) => 
                        updateNestedSetting(['callDuration', 'shortCalls', 'enabled'], enabled)
                      }
                      data-testid="switch-duration-short"
                    />
                    <Input
                      id="duration-short"
                      type="number"
                      min="0"
                      value={localSettings.callDuration.shortCalls.threshold}
                      onChange={(e) => 
                        updateNestedSetting(['callDuration', 'shortCalls', 'threshold'], Number(e.target.value))
                      }
                      disabled={!localSettings.callDuration.shortCalls.enabled}
                      className="w-24"
                      data-testid="input-duration-short"
                    />
                    <Select
                      value={localSettings.callDuration.shortCalls.level}
                      onValueChange={(level) => 
                        updateNestedSetting(['callDuration', 'shortCalls', 'level'], level)
                      }
                      disabled={!localSettings.callDuration.shortCalls.enabled}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {warningDescriptions.callDuration.shortCalls}
                  </p>
                </div>

                {/* Long Calls */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="duration-long">Long Calls Alert (seconds)</Label>
                    <Badge variant="secondary">Default: 600s</Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={localSettings.callDuration.longCalls.enabled}
                      onCheckedChange={(enabled) => 
                        updateNestedSetting(['callDuration', 'longCalls', 'enabled'], enabled)
                      }
                      data-testid="switch-duration-long"
                    />
                    <Input
                      id="duration-long"
                      type="number"
                      min="0"
                      value={localSettings.callDuration.longCalls.threshold}
                      onChange={(e) => 
                        updateNestedSetting(['callDuration', 'longCalls', 'threshold'], Number(e.target.value))
                      }
                      disabled={!localSettings.callDuration.longCalls.enabled}
                      className="w-24"
                      data-testid="input-duration-long"
                    />
                    <Select
                      value={localSettings.callDuration.longCalls.level}
                      onValueChange={(level) => 
                        updateNestedSetting(['callDuration', 'longCalls', 'level'], level)
                      }
                      disabled={!localSettings.callDuration.longCalls.enabled}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {warningDescriptions.callDuration.longCalls}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Error Rate Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Error Rate Monitoring</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Critical Error Rate */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="error-critical">Critical Error Rate (%)</Label>
                    <Badge variant="destructive">Default: 15%</Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={localSettings.errorRate.critical.enabled}
                      onCheckedChange={(enabled) => 
                        updateNestedSetting(['errorRate', 'critical', 'enabled'], enabled)
                      }
                      data-testid="switch-error-critical"
                    />
                    <Input
                      id="error-critical"
                      type="number"
                      min="0"
                      max="100"
                      value={localSettings.errorRate.critical.threshold}
                      onChange={(e) => 
                        updateNestedSetting(['errorRate', 'critical', 'threshold'], Number(e.target.value))
                      }
                      disabled={!localSettings.errorRate.critical.enabled}
                      className="w-24"
                      data-testid="input-error-critical"
                    />
                    <Select
                      value={localSettings.errorRate.critical.level}
                      onValueChange={(level) => 
                        updateNestedSetting(['errorRate', 'critical', 'level'], level)
                      }
                      disabled={!localSettings.errorRate.critical.enabled}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {warningDescriptions.errorRate.critical}
                  </p>
                </div>

                {/* Warning Error Rate */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="error-warning">Warning Error Rate (%)</Label>
                    <Badge variant="secondary">Default: 5%</Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={localSettings.errorRate.warning.enabled}
                      onCheckedChange={(enabled) => 
                        updateNestedSetting(['errorRate', 'warning', 'enabled'], enabled)
                      }
                      data-testid="switch-error-warning"
                    />
                    <Input
                      id="error-warning"
                      type="number"
                      min="0"
                      max="100"
                      value={localSettings.errorRate.warning.threshold}
                      onChange={(e) => 
                        updateNestedSetting(['errorRate', 'warning', 'threshold'], Number(e.target.value))
                      }
                      disabled={!localSettings.errorRate.warning.enabled}
                      className="w-24"
                      data-testid="input-error-warning"
                    />
                    <Select
                      value={localSettings.errorRate.warning.level}
                      onValueChange={(level) => 
                        updateNestedSetting(['errorRate', 'warning', 'level'], level)
                      }
                      disabled={!localSettings.errorRate.warning.enabled}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {warningDescriptions.errorRate.warning}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Additional Alerts</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Assistant Performance */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="assistant-performance">Assistant Performance (%)</Label>
                    <Badge variant="secondary">Default: 80%</Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={localSettings.assistantPerformance.threshold.enabled}
                      onCheckedChange={(enabled) => 
                        updateNestedSetting(['assistantPerformance', 'threshold', 'enabled'], enabled)
                      }
                      data-testid="switch-assistant-performance"
                    />
                    <Input
                      id="assistant-performance"
                      type="number"
                      min="0"
                      max="100"
                      value={localSettings.assistantPerformance.threshold.threshold}
                      onChange={(e) => 
                        updateNestedSetting(['assistantPerformance', 'threshold', 'threshold'], Number(e.target.value))
                      }
                      disabled={!localSettings.assistantPerformance.threshold.enabled}
                      className="w-24"
                      data-testid="input-assistant-performance"
                    />
                    <Select
                      value={localSettings.assistantPerformance.threshold.level}
                      onValueChange={(level) => 
                        updateNestedSetting(['assistantPerformance', 'threshold', 'level'], level)
                      }
                      disabled={!localSettings.assistantPerformance.threshold.enabled}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {warningDescriptions.assistantPerformance.threshold}
                  </p>
                </div>

                {/* Call Volume */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="call-volume">High Call Volume</Label>
                    <Badge variant="secondary">Default: 1000</Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={localSettings.callVolume.highVolume.enabled}
                      onCheckedChange={(enabled) => 
                        updateNestedSetting(['callVolume', 'highVolume', 'enabled'], enabled)
                      }
                      data-testid="switch-call-volume"
                    />
                    <Input
                      id="call-volume"
                      type="number"
                      min="0"
                      value={localSettings.callVolume.highVolume.threshold}
                      onChange={(e) => 
                        updateNestedSetting(['callVolume', 'highVolume', 'threshold'], Number(e.target.value))
                      }
                      disabled={!localSettings.callVolume.highVolume.enabled}
                      className="w-24"
                      data-testid="input-call-volume"
                    />
                    <Select
                      value={localSettings.callVolume.highVolume.level}
                      onValueChange={(level) => 
                        updateNestedSetting(['callVolume', 'highVolume', 'level'], level)
                      }
                      disabled={!localSettings.callVolume.highVolume.enabled}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {warningDescriptions.callVolume.highVolume}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Section */}
        <div className="flex items-center justify-between p-6 bg-card rounded-lg border border-border">
          <div>
            <p className="text-sm text-muted-foreground">
              Changes are saved locally and will persist across sessions. 
              {hasChanges && " You have unsaved changes."}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
            >
              Reset All
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}