import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  customDateRange?: { from: Date; to: Date } | null;
  onCustomDateChange?: (range: { from: Date; to: Date } | null) => void;
}

export default function TimeRangeSelector({
  value,
  onChange,
  customDateRange,
  onCustomDateChange,
}: TimeRangeSelectorProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [pendingRange, setPendingRange] = useState<DateRange | undefined>(
    customDateRange ? { from: customDateRange.from, to: customDateRange.to } : undefined
  );

  const handlePresetChange = (newValue: string) => {
    if (newValue === "custom-range") {
      setDatePickerOpen(true);
    } else {
      onChange(newValue);
      onCustomDateChange?.(null);
    }
  };

  const handleApply = () => {
    if (pendingRange?.from && pendingRange?.to) {
      onCustomDateChange?.({ from: pendingRange.from, to: pendingRange.to });
      onChange("custom-range");
      setDatePickerOpen(false);
    }
  };

  const handleCancel = () => {
    setPendingRange(
      customDateRange ? { from: customDateRange.from, to: customDateRange.to } : undefined
    );
    setDatePickerOpen(false);
    if (value === "custom-range" && !customDateRange) {
      onChange("last-7-days");
    }
  };

  const isCustomActive = value === "custom-range" && customDateRange;

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={handlePresetChange}>
        <SelectTrigger className={cn("w-44", isCustomActive && "hidden")}>
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="last-7-days">Last 7 days</SelectItem>
          <SelectItem value="last-30-days">Last 30 days</SelectItem>
          <SelectItem value="last-90-days">Last 90 days</SelectItem>
          <SelectItem value="all-time">All time</SelectItem>
          <SelectItem value="custom-range">Custom range</SelectItem>
        </SelectContent>
      </Select>

      {isCustomActive && (
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-auto justify-start text-left font-normal gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(customDateRange.from, "MMM d, yyyy")} – {format(customDateRange.to, "MMM d, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={pendingRange}
              onSelect={setPendingRange}
              numberOfMonths={2}
              disabled={{ after: new Date() }}
              defaultMonth={pendingRange?.from || new Date()}
            />
            <div className="flex items-center justify-between p-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onCustomDateChange?.(null);
                  onChange("last-7-days");
                  setDatePickerOpen(false);
                }}
              >
                Clear
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleApply}
                  disabled={!pendingRange?.from || !pendingRange?.to}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {!isCustomActive && (
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <span className="hidden" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={pendingRange}
              onSelect={setPendingRange}
              numberOfMonths={2}
              disabled={{ after: new Date() }}
              defaultMonth={new Date()}
            />
            <div className="flex items-center justify-end gap-2 p-3 border-t">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                disabled={!pendingRange?.from || !pendingRange?.to}
              >
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
