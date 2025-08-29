import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Eye, Phone } from "lucide-react";
import { DashboardData } from "@shared/schema";
import CallDetailsPopover from "./call-details-popover";

interface RecentCallsTableProps {
  data: DashboardData['recentCalls'];
  isLoading: boolean;
}

export default function RecentCallsTable({ data, isLoading }: RecentCallsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");

  const getTimeFilteredData = () => {
    let filteredByTime = data;
    const now = new Date();
    
    switch (timeFilter) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredByTime = data.filter(call => new Date(call.createdAt) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredByTime = data.filter(call => new Date(call.createdAt) >= monthAgo);
        break;
      case 'custom':
        // For now, same as all - can be extended later
        filteredByTime = data;
        break;
      default: // 'all'
        filteredByTime = data;
    }
    
    return filteredByTime.filter(call =>
      call.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  
  const filteredData = getTimeFilteredData();

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

  const getSuccessEvaluationBadge = (status: string, endedReason: string) => {
    // Determine if the call was successful based on status and ended reason
    const isSuccessful = status.toLowerCase() === 'completed' || 
                        endedReason === 'customer-ended-call' ||
                        endedReason === 'assistant-ended-call';
    
    return (
      <Badge className={`${
        isSuccessful 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      } border-0`}>
        {isSuccessful ? 'Pass' : 'Fail'}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const isInbound = type === 'inbound';
    return (
      <Badge className={`${
        isInbound 
          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' 
          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      } border-0`}>
        {isInbound ? 'Inbound' : 'Outbound'}
      </Badge>
    );
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
                <TableHead className="text-foreground font-medium sticky top-0 bg-muted">Type</TableHead>
                <TableHead className="text-foreground font-medium sticky top-0 bg-muted">
                  <div className="flex items-center space-x-1">
                    <span>Assistant</span>
                    <Phone size={12} />
                  </div>
                </TableHead>
                <TableHead className="text-foreground font-medium sticky top-0 bg-muted">
                  <div className="flex items-center space-x-1">
                    <span>Customer</span>
                    <Phone size={12} />
                  </div>
                </TableHead>
                <TableHead className="text-foreground font-medium sticky top-0 bg-muted">Date & Time</TableHead>
                <TableHead className="text-foreground font-medium sticky top-0 bg-muted">Duration</TableHead>
                <TableHead className="text-foreground font-medium sticky top-0 bg-muted">Cost</TableHead>
                <TableHead className="text-foreground font-medium sticky top-0 bg-muted">Success Evaluation</TableHead>
                <TableHead className="text-foreground font-medium sticky top-0 bg-muted">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? "No calls found matching your search." : "No calls available for the selected time range."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((call) => (
                  <TableRow key={call.id} className="hover:bg-muted/50 transition-colors" data-testid={`row-call-${call.id}`}>
                    <TableCell className="font-mono text-sm">{call.id.substring(0, 8)}...</TableCell>
                    <TableCell>{getTypeBadge(call.type)}</TableCell>
                    <TableCell className="font-mono text-xs">{call.assistantPhoneNumber}</TableCell>
                    <TableCell className="font-mono text-xs">{call.customerPhoneNumber}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(call.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit',
                      })}
                      <br />
                      <span className="text-xs text-muted-foreground/70">
                        {new Date(call.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </TableCell>
                    <TableCell>{formatDuration(call.duration)}</TableCell>
                    <TableCell>{formatCurrency(call.cost)}</TableCell>
                    <TableCell>{getSuccessEvaluationBadge(call.status, call.endedReason)}</TableCell>
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