import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Eye, 
  Clock, 
  DollarSign, 
  Phone, 
  User, 
  Calendar,
  ExternalLink
} from "lucide-react";

interface CallDetailsPopoverProps {
  callId: string;
  children: React.ReactNode;
}

interface CallDetails {
  id: string;
  status: string;
  assistantId: string;
  phoneNumberId: string;
  customer: {
    number: string;
  };
  duration: number;
  cost: number;
  endedReason: string;
  createdAt: string;
  updatedAt: string;
  summary?: string;
  transcript?: string;
}

export default function CallDetailsPopover({ callId, children }: CallDetailsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: callDetails, isLoading } = useQuery<CallDetails>({
    queryKey: ["/api/calls", callId],
    enabled: isOpen,
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return (
          <Badge className="bg-chart-2/10 text-chart-2">
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-destructive/10 text-destructive">
            Failed
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge className="bg-chart-3/10 text-chart-3">
            In Progress
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

  const formatEndedReason = (reason: string) => {
    return reason
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const openInVapi = () => {
    window.open(`https://dashboard.vapi.ai/call/${callId}`, '_blank');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Call Details</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={openInVapi}
              className="text-primary hover:text-primary/80"
              data-testid="button-open-vapi"
            >
              <ExternalLink size={14} className="mr-1" />
              Open in Vapi
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : callDetails ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(callDetails.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="text-chart-3" size={16} />
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-medium">{formatDuration(callDetails.duration)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <DollarSign className="text-chart-4" size={16} />
                  <div>
                    <p className="text-xs text-muted-foreground">Cost</p>
                    <p className="text-sm font-medium">{formatCurrency(callDetails.cost)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="text-muted-foreground" size={14} />
                  <span className="text-xs text-muted-foreground">Customer:</span>
                  <span className="text-sm">{callDetails.customer?.number || 'Unknown'}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <User className="text-muted-foreground" size={14} />
                  <span className="text-xs text-muted-foreground">Assistant:</span>
                  <span className="text-sm font-mono text-xs">{callDetails.assistantId.slice(0, 8)}...</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="text-muted-foreground" size={14} />
                  <span className="text-xs text-muted-foreground">Started:</span>
                  <span className="text-sm">
                    {new Date(callDetails.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs text-muted-foreground mb-1">Ended Reason</p>
                <p className="text-sm">{formatEndedReason(callDetails.endedReason)}</p>
              </div>

              {callDetails.summary && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Summary</p>
                    <p className="text-sm leading-relaxed">{callDetails.summary}</p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>Failed to load call details</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}