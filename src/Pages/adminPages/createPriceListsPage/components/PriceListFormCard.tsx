import { Check, ChevronsUpDown, Plus, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  getCategoryLabel,
  type PriceForm,
  predefinedCategories,
} from "./priceListTypes";

type PriceListFormCardProps = {
  form: PriceForm;
  editingId: string | null;
  availableCategories?: string[];
  onFormChange: (updates: Partial<PriceForm>) => void;
  onSubmit: () => void;
  onReset: () => void;
};

export function PriceListFormCard({
  form,
  editingId,
  availableCategories = [],
  onFormChange,
  onSubmit,
  onReset,
}: PriceListFormCardProps) {
  const [open, setOpen] = useState(false);
  const isPredefined = predefinedCategories.includes(form.category as any);
  const [customCategory, setCustomCategory] = useState("");

  useEffect(() => {
    if (!isPredefined && form.category !== "other") {
      setCustomCategory(form.category);
    } else {
      setCustomCategory("");
    }
  }, [form.category, isPredefined]);

  const handleCategorySelect = (value: string) => {
    if (value === "other") {
      onFormChange({ category: "other" });
    } else {
      onFormChange({ category: value });
    }
    setOpen(false);
  };

  const handleCustomCategoryChange = (value: string) => {
    setCustomCategory(value);
    onFormChange({ category: value });
  };

  return (
    <Card className="xl:col-span-1">
      <CardHeader>
        <CardTitle>{editingId ? "Edit Price Item" : "Add Price Item"}</CardTitle>
        <CardDescription>
          Enter the item name, select a billing category, and attach the price tag.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="price-name">Item Name</Label>
          <Input
            id="price-name"
            value={form.name}
            onChange={(e) => onFormChange({ name: e.target.value })}
            placeholder="e.g. General Consultation Fee"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-1">
          <div className="space-y-2">
            <Label>Category</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between font-normal"
                >
                  {form.category === "other"
                    ? "Other (Create New)"
                    : form.category
                    ? getCategoryLabel(form.category)
                    : "Select category..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search category..." />
                  <CommandList>
                    <CommandEmpty>No category found.</CommandEmpty>
                    <CommandGroup>
                      {availableCategories.map((cat) => (
                        <CommandItem
                          key={cat}
                          value={cat}
                          onSelect={() => handleCategorySelect(cat)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              form.category === cat ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {getCategoryLabel(cat)}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {(form.category === "other" || !isPredefined) && form.category !== "" && (
            <div className="space-y-2">
              <Label htmlFor="custom-category">Custom Category Name</Label>
              <Input
                id="custom-category"
                value={customCategory}
                onChange={(e) => handleCustomCategoryChange(e.target.value)}
                placeholder="Enter new category name"
                autoFocus
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="price-unit">Billing Unit</Label>
            <Input
              id="price-unit"
              value={form.unit}
              onChange={(e) => onFormChange({ unit: e.target.value })}
              placeholder="per item / per visit / per day"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price-amount">Price Amount (NGN)</Label>
          <Input
            id="price-amount"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => onFormChange({ price: e.target.value })}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price-description">Description</Label>
          <Textarea
            id="price-description"
            value={form.description}
            onChange={(e) => onFormChange({ description: e.target.value })}
            placeholder="Add a short note about what this fee covers"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Active for Billing</p>
            <p className="text-xs text-muted-foreground">
              Inactive items stay on the list but can be hidden from active use.
            </p>
          </div>
          <Switch
            checked={form.isActive}
            onCheckedChange={(checked) => onFormChange({ isActive: checked })}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onSubmit} className="bg-[#56bbe3] text-white hover:bg-[#56bbe3]/80 hover:text-white transition-colors duration-300">
            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? "Update Item" : "Add to Price List"}
          </Button>
          <Button type="button" variant="outline" onClick={onReset}>
            Clear Form
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
