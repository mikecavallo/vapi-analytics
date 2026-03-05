import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  DollarSign,
  Phone,
  User,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  PhoneIncoming,
  PhoneOutgoing,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import AudioPlayer from "@/components/audio-player";

interface CallDetailsPopoverProps {
  callId: string;
  children: React.ReactNode;
}

interface CallDetails {
  id: string;
  status: string;
  assistantId: string;
  phoneNumberId: string;
  type?: string;
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
  recordingUrl?: string;
  analysis?: {
    summary?: string;
    structuredData?: Record<string, unknown>;
    successEvaluation?: string;
  };
}

export default function CallDetailsPopover({ callId, children }: CallDetailsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  const { toast } = useToast();

  const { data: callDetails, isLoading } = useQuery<CallDetails>({
    queryKey: ["/api/calls", callId],
    enabled: isOpen,
  });

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds === null || seconds === undefined) {
      return "0:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <Badge className="bg-chart-2/10 text-chart-2">Completed</Badge>
        );
      case "failed":
        return (
          <Badge className="bg-destructive/10 text-destructive">Failed</Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-chart-3/10 text-chart-3">In Progress</Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground">{status}</Badge>
        );
    }
  };

  const formatEndedReason = (reason: string) => {
    if (!reason) return "Unknown";
    return reason
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copied",
        description: `${field} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const openInVapi = () => {
    window.open(`https://dashboard.vapi.ai/calls?callId=${callId}`, "_blank");
  };

  const getCallTypeInfo = (type?: string) => {
    if (type === "inbound" || type === "inboundPhoneCall") {
      return {
        label: "Inbound",
        icon: <PhoneIncoming size={14} className="text-chart-2" />,
        badge: <Badge className="bg-chart-2/10 text-chart-2">Inbound</Badge>,
      };
    }
    return {
      label: "Outbound",
      icon: <PhoneOutgoing size={14} className="text-chart-4" />,
      badge: <Badge className="bg-chart-4/10 text-chart-4">Outbound</Badge>,
    };
  };

  const TRANSCRIPT_PREVIEW_LENGTH = 500;

  const renderTranscript = (transcript: string) => {
    const isLong = transcript.length > TRANSCRIPT_PREVIEW_LENGTH;
    const displayText =
      isLong && !transcriptExpanded
        ? transcript.slice(0, TRANSCRIPT_PREVIEW_LENGTH) + "..."
        : transcript;

    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Transcript</p>
          </div>
          {isLong && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setTranscriptExpanded(!transcriptExpanded)}
            >
              {transcriptExpanded ? (
                <>
                  Show less <ChevronUp size={12} className="ml-1" />
                </>
              ) : (
                <>
                  Show more <ChevronDown size={12} className="ml-1" />
                </>
              )}
            </Button>
          )}
        </div>
        <div className="rounded-md border bg-muted/50 p-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {displayText}
          </p>
        </div>
      </div>
    );
  };

  const CopyableField = ({
    label,
    value,
    fieldName,
    mono = false,
  }: {
    label: string;
    value: string;
    fieldName: string;
    mono?: boolean;
  }) => (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs text-muted-foreground shrink-0">{label}</span>
        <span
          className={`text-sm truncate ${mono ? "font-mono text-xs" : ""}`}
          title={value}
        >
          {value}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={() => copyToClipboard(value, fieldName)}
      >
        {copiedField === fieldName ? (
          <Check size={12} className="text-chart-2" />
        ) : (
          <Copy size={12} />
        )}
      </Button>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 flex flex-col"
      >
        <SheetHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">Call Details</SheetTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={openInVapi}
              className="text-primary hover:text-primary/80"
              data-testid="button-open-vapi"
            >
              <ExternalLink size={14} className="mr-1" />
              Open in Vapi
            </Button>
          </div>
          <SheetDescription className="sr-only">
            Detailed information about the selected call
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          {isLoading ? (
            <div className="space-y-4 pt-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : callDetails ? (
            <div className="space-y-5 pt-4">
              {/* Cost + Duration Hero */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign size={16} className="text-chart-4" />
                    <span className="text-xs text-muted-foreground">Cost</span>
                  </div>
                  <p className="text-2xl font-bold tracking-tight">
                    {formatCurrency(callDetails.cost)}
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={16} className="text-chart-3" />
                    <span className="text-xs text-muted-foreground">
                      Duration
                    </span>
                  </div>
                  <p className="text-2xl font-bold tracking-tight">
                    {formatDuration(callDetails.duration || 0)}
                  </p>
                </div>
              </div>

              {/* Status + Type Row */}
              <div className="flex items-center gap-3 flex-wrap">
                {getStatusBadge(callDetails.status)}
                {getCallTypeInfo(callDetails.type).badge}
                {callDetails.endedReason && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <AlertCircle size={13} />
                    <span>{formatEndedReason(callDetails.endedReason)}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Call Metadata */}
              <div className="space-y-2.5">
                <p className="text-sm font-medium text-foreground">Metadata</p>
                <div className="space-y-1.5">
                  <CopyableField
                    label="Call ID"
                    value={callDetails.id}
                    fieldName="Call ID"
                    mono
                  />
                  <CopyableField
                    label="Assistant ID"
                    value={callDetails.assistantId}
                    fieldName="Assistant ID"
                    mono
                  />
                  {callDetails.phoneNumberId && (
                    <CopyableField
                      label="Phone Number ID"
                      value={callDetails.phoneNumberId}
                      fieldName="Phone Number ID"
                      mono
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Customer</span>
                    <span className="text-sm">
                      {callDetails.customer?.number || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Created</span>
                    <span className="text-sm">
                      {formatDateTime(callDetails.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Audio Recording Player */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">
                  Recording
                </p>
                <AudioPlayer recordingUrl={callDetails.recordingUrl} />
              </div>

              {/* Summary */}
              {callDetails.summary && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">
                      Summary
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {callDetails.summary}
                    </p>
                  </div>
                </>
              )}

              {/* Analysis */}
              {callDetails.analysis?.summary && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">
                      Analysis
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {callDetails.analysis.summary}
                    </p>
                    {callDetails.analysis.successEvaluation && (
                      <div className="mt-2">
                        <Badge
                          className={
                            callDetails.analysis.successEvaluation === "true"
                              ? "bg-chart-2/10 text-chart-2"
                              : "bg-destructive/10 text-destructive"
                          }
                        >
                          {callDetails.analysis.successEvaluation === "true"
                            ? "Success"
                            : "Unsuccessful"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Transcript */}
              {callDetails.transcript && (
                <>
                  <Separator />
                  {renderTranscript(callDetails.transcript)}
                </>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground pt-8">
              <p>Failed to load call details</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
