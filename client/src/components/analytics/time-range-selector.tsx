import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Select range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="last-7-days">Last 7 days</SelectItem>
        <SelectItem value="last-30-days">Last 30 days</SelectItem>
        <SelectItem value="last-90-days">Last 90 days</SelectItem>
        <SelectItem value="all-time">All time</SelectItem>
        <SelectItem value="custom-range">Custom range</SelectItem>
      </SelectContent>
    </Select>
  );
}
