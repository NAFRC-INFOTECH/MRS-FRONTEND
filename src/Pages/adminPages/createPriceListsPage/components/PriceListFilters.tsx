import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getCategoryLabel, type PriceCategory } from "./priceListTypes";

type PriceListFiltersProps = {
  searchTerm: string;
  categoryFilter: "all" | PriceCategory;
  activeOnly: boolean;
  availableCategories?: string[];
  onSearchChange: (value: string) => void;
  onCategoryFilterChange: (value: "all" | PriceCategory) => void;
  onActiveOnlyChange: (value: boolean) => void;
};

export function PriceListFilters({
  searchTerm,
  categoryFilter,
  activeOnly,
  availableCategories = [],
  onSearchChange,
  onCategoryFilterChange,
  onActiveOnlyChange,
}: PriceListFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div className="relative md:col-span-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search item name, description, or billing unit"
          className="pl-9"
        />
      </div>

      <Select
        value={categoryFilter}
        onValueChange={(value) => onCategoryFilterChange(value as "all" | PriceCategory)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {availableCategories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {getCategoryLabel(cat)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center justify-between rounded-md border px-3">
        <Label htmlFor="active-only" className="text-sm">
          Active Only
        </Label>
        <Switch id="active-only" checked={activeOnly} onCheckedChange={onActiveOnlyChange} />
      </div>
    </div>
  );
}
