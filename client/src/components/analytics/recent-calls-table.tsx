import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Eye } from "lucide-react";
import { DashboardData } from "@shared/schema";
import CallDetailsPopover from "./call-details-popover";

interface RecentCallsTableProps {
  data: DashboardData['recentCalls'];
  isLoading: boolean;
}

export default function RecentCallsTable({ data, isLoading }: RecentCallsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");

  const filteredData = data.filter(call =>
    call.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    call.assistantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds === null || seconds === undefined) {
      return "0:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return "$0.00";
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'customer-ended-call':
        return (
          <Badge className="bg-chart-2/10 text-chart-2 hover:bg-chart-2/20">
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">
            Failed
          </Badge>
        );
      case 'assistant-ended-call':
        return (
          <Badge className="bg-chart-3/10 text-chart-3 hover:bg-chart-3/20">
            Assistant Ended
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card data-testid="table-recent-calls">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle>Recent Calls</CardTitle>
          <div className="flex items-center space-x-4">
            {/* Time Filter Buttons */}
            <div className="flex space-x-1 border rounded-md p-1">
              <Button
                size="sm"
                variant={timeFilter === "all" ? "default" : "ghost"}
                onClick={() => setTimeFilter("all")}
                className="h-7 px-2 text-xs"
                data-testid="button-all-calls"
              >
                All
              </Button>
              <Button
                size="sm"
                variant={timeFilter === "week" ? "default" : "ghost"}
                onClick={() => setTimeFilter("week")}
                className="h-7 px-2 text-xs"
                data-testid="button-week-calls"
              >
                Week
              </Button>
              <Button
                size="sm"
                variant={timeFilter === "month" ? "default" : "ghost"}
                onClick={() => setTimeFilter("month")}
                className="h-7 px-2 text-xs"
                data-testid="button-month-calls"
              >
                Month
              </Button>
              <Button
                size="sm"
                variant={timeFilter === "custom" ? "default" : "ghost"}
                onClick={() => setTimeFilter("custom")}
                className="h-7 px-2 text-xs"
                data-testid="button-custom-calls"
              >
                Custom
              </Button>
            </div>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search calls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
                data-testid="input-search-calls"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            </div>
            <Button variant="ghost" size="sm" data-testid="button-filter">
              <Filter size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="text-foreground font-medium sticky top-0 bg-muted">Call ID</TableHead>
                <TableHead className="text-foreground font-medium sticky top-0 bg-muted">Assistant</TableHead>
                <TableHead className="text-foreground font-medium sticky top-0 bg-muted">Duration</TableHead>
                <TableHead className="text-foreground font-medium sticky top-0 bg-muted">Cost</TableHead>
                <TableHead className="text-foreground font-medium sticky top-0 bg-muted">Status</TableHead>
                <TableHead className="text-foreground font-medium sticky top-0 bg-muted">Date</TableHead>
                <TableHead className="text-foreground font-medium sticky top-0 bg-muted">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? "No calls found matching your search." : "No calls available for the selected time range."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((call) => (
                  <TableRow key={call.id} className="hover:bg-muted/50 transition-colors" data-testid={`row-call-${call.id}`}>
                    <TableCell className="font-mono text-sm">{call.id.substring(0, 8)}...</TableCell>
                    <TableCell>{call.assistantName}</TableCell>
                    <TableCell>{formatDuration(call.duration)}</TableCell>
                    <TableCell>{formatCurrency(call.cost)}</TableCell>
                    <TableCell>{getStatusBadge(call.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(call.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <CallDetailsPopover callId={call.id}>
                          <Button size="sm" variant="ghost" data-testid={`button-view-${call.id}`}>
                            <Eye size={14} />
                          </Button>
                        </CallDetailsPopover>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {!isLoading && filteredData.length > 0 && (
          <div className="p-4 border-t border-border text-center">
            <div className="text-sm text-muted-foreground">
              Showing {filteredData.length} {filteredData.length === 1 ? 'call' : 'calls'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}