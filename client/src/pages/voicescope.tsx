import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/layout/site-header";
import { Activity, BarChart3, Mic, Users } from "lucide-react";

export default function VoiceScopePage() {
  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" data-testid="heading-voicescope">
              VoiceScope
            </h1>
            <p className="text-gray-600 dark:text-gray-300" data-testid="text-voicescope-description">
              Advanced voice AI monitoring and real-time analytics dashboard
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card data-testid="card-active-calls">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Calls</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-active-calls-count">23</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12%</span> from last hour
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-live-agents">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Live Agents</CardTitle>
                <Mic className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-live-agents-count">8</div>
                <p className="text-xs text-muted-foreground">
                  Across 3 assistants
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-concurrent-users">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concurrent Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-concurrent-users-count">156</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-blue-600">+5%</span> from yesterday
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-system-health">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="text-system-health-status">98.9%</div>
                <p className="text-xs text-muted-foreground">
                  Uptime this month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="card-real-time-monitoring">
              <CardHeader>
                <CardTitle>Real-time Monitoring</CardTitle>
                <CardDescription>Live voice AI performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Real-time charts will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-assistant-performance">
              <CardHeader>
                <CardTitle>Assistant Performance</CardTitle>
                <CardDescription>Voice AI assistant analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Mic className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Assistant performance metrics will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}