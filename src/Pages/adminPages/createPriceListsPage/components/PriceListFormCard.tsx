import { Check, ChevronsUpDown, Plus, Save } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
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
import { useDepartmentsQuery } from "@/api-integration/queries/departments";
import { usePriceItemsQuery } from "@/api-integration/queries/priceList";
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
  const deptQ = useDepartmentsQuery();
  const bedItemsQ = usePriceItemsQuery({ q: undefined, category: "bed", activeOnly: false });
  const [wardOpen, setWardOpen] = useState(false);
  const [wardKey, setWardKey] = useState<"" | "MaleWard" | "FemaleWard" | "MaleVIP" | "FemaleVIP" | "ChildrenWard">("");

  const normalizeWardKey = (value: string) => {
    return value.toLowerCase().replace(/[^a-z]/g, "");
  };

  const wardKeyFromName = (name: string) => {
    const n = normalizeWardKey(name);
    if (n.includes("malevip")) return "MaleVIP";
    if (n.includes("femalevip")) return "FemaleVIP";
    if (n.includes("childrenward") || n.includes("children")) return "ChildrenWard";
    if (n.includes("maleward")) return "MaleWard";
    if (n.includes("femaleward")) return "FemaleWard";
    return "";
  };

  const existingBedFeeByWardKey = useMemo(() => {
    const m = new Map<string, string>();
    const list = (bedItemsQ.data || []) as any[];
    for (const it of list) {
      const k = wardKeyFromName(String(it?.name || ""));
      if (k && !m.has(k)) m.set(k, String(it._id || ""));
    }
    return m;
  }, [bedItemsQ.data]);

  const wardOptions = useMemo(() => {
    const list = (deptQ.data || []) as any[];
    const keys = ["MaleWard", "FemaleWard", "MaleVIP", "FemaleVIP", "ChildrenWard"] as const;
    const labels: Record<string, string> = {
      MaleWard: "Male Ward",
      FemaleWard: "Female Ward",
      MaleVIP: "Male VIP Ward",
      FemaleVIP: "Female VIP Ward",
      ChildrenWard: "Children Ward (Under 16)",
    };
    return keys
      .map((k) => {
        const dept = list.find((d) => String(d?.name || "").toLowerCase() === k.toLowerCase());
        const existingId = existingBedFeeByWardKey.get(k) || "";
        const isTaken = !!existingId && existingId !== String(editingId || "");
        return {
          key: k,
          label: labels[k],
          departmentId: dept?._id ? String(dept._id) : "",
          bedCapacity: dept?.bedCapacity !== undefined ? Number(dept.bedCapacity) : undefined,
          isTaken,
        };
      })
      .filter((x) => !!x.key);
  }, [deptQ.data, existingBedFeeByWardKey, editingId]);

  const selectedWard = useMemo(() => {
    return wardOptions.find((w) => w.key === wardKey) || null;
  }, [wardOptions, wardKey]);

  useEffect(() => {
    if (!isPredefined && form.category !== "other") {
      setCustomCategory(form.category);
    } else {
      setCustomCategory("");
    }
  }, [form.category, isPredefined]);

  useEffect(() => {
    if (form.category !== "bed") {
      if (wardKey) setWardKey("");
      return;
    }

    const currentKey = wardKey || wardKeyFromName(String(form.name || ""));

    const nextKey = (currentKey || wardOptions[0]?.key || "") as any;
    if (!nextKey) return;
    if (nextKey !== wardKey) setWardKey(nextKey);

    const nextWard = wardOptions.find((w) => w.key === nextKey);
    if (!nextWard) return;
    const nextName = `${nextWard.label} Bed Fee`;
    const nextUnit = form.unit && form.unit.trim().length > 0 && form.unit !== "per item" ? form.unit : "per day";
    const nextStock =
      typeof nextWard.bedCapacity === "number" && Number.isFinite(nextWard.bedCapacity)
        ? String(nextWard.bedCapacity)
        : form.stockQuantity && String(form.stockQuantity).trim().length > 0
          ? form.stockQuantity
          : "5";
    onFormChange({
      name: form.name?.trim() ? form.name : nextName,
      unit: nextUnit,
      stockQuantity: nextStock,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.category, wardOptions]);

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
            placeholder={form.category === "bed" ? "Auto-filled from ward selection" : "e.g. General Consultation Fee"}
            disabled={form.category === "bed" && !!wardKey}
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

          {form.category === "bed" && (
            <div className="space-y-2">
              <Label>Ward (Sub Category)</Label>
              <Popover open={wardOpen} onOpenChange={setWardOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={wardOpen}
                    className="w-full justify-between font-normal"
                  >
                    {selectedWard ? selectedWard.label : "Select ward..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search ward..." />
                    <CommandList>
                      <CommandEmpty>No ward found.</CommandEmpty>
                      <CommandGroup>
                        {wardOptions.map((w) => (
                          <CommandItem
                            key={w.key}
                            value={w.label}
                            disabled={w.isTaken}
                            onSelect={() => {
                              if (w.isTaken) return;
                              setWardKey(w.key);
                              onFormChange({
                                name: `${w.label} Bed Fee`,
                                unit: form.unit && form.unit.trim().length > 0 && form.unit !== "per item" ? form.unit : "per day",
                                stockQuantity:
                                  typeof w.bedCapacity === "number" && Number.isFinite(w.bedCapacity)
                                    ? String(w.bedCapacity)
                                    : form.stockQuantity && String(form.stockQuantity).trim().length > 0
                                      ? form.stockQuantity
                                      : "5",
                              });
                              setWardOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                wardKey === w.key ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {w.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

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

        {(form.category === "drug" || form.category === "bed") && (
          <div className="grid grid-cols-1 gap-4 rounded-lg border p-3">
            <div className="space-y-2">
              <Label htmlFor="stock-quantity">{form.category === "bed" ? "Bed Quantity" : "Stock Quantity"}</Label>
              <Input
                id="stock-quantity"
                type="number"
                min={form.category === "bed" ? "5" : "0"}
                max={form.category === "bed" ? "50" : undefined}
                value={form.stockQuantity}
                onChange={(e) => onFormChange({ stockQuantity: e.target.value })}
                placeholder={form.category === "bed" ? "5 - 50" : "e.g. 1000"}
              />
              <p className="text-xs text-muted-foreground">
                {form.category === "bed" ? "Total beds available for this ward" : "Total received in stock"}
              </p>
            </div>
            {/* <div className="space-y-2">
              <Label htmlFor="sold-quantity">Sold Quantity</Label>
              <Input
                id="sold-quantity"
                type="number"
                min="0"
                value={form.soldQuantity}
                onChange={(e) => onFormChange({ soldQuantity: e.target.value })}
                placeholder="e.g. 250"
              />
              <p className="text-xs text-muted-foreground">Total sold/dispensed</p>
            </div> */}
          </div>
        )}

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
