import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { usePriceItemsQuery, usePriceSummariesQuery } from "@/api-integration/queries/priceList";
import {
  useCreatePriceItemMutation,
  useDeletePriceItemMutation,
  useUpdatePriceItemMutation,
  useClonePriceListMonthMutation,
} from "@/api-integration/mutations/priceList";

const PriceListFilters = lazy(() =>
  import("./components/PriceListFilters").then((m) => ({ default: m.PriceListFilters }))
);
const PriceListFormCard = lazy(() =>
  import("./components/PriceListFormCard").then((m) => ({ default: m.PriceListFormCard }))
);
const PriceListSummaryCards = lazy(() => import("./components/PriceListSummaryCards"));
const PriceListTable = lazy(() =>
  import("./components/PriceListTable").then((m) => ({ default: m.PriceListTable }))
);
const PriceListTemplates = lazy(() =>
  import("./components/PriceListTemplates").then((m) => ({ default: m.PriceListTemplates }))
);
const TopSellingDrugsCard = lazy(() => import("./components/TopSellingDrugsCard"));

import {
  defaultForm,
  quickAddTemplates,
  calculatePriceSummary,
  predefinedCategories,
  type PriceCategory,
  type PriceForm,
  type PriceItem,
  type PriceTemplate,
  type PriceSummary,
  type SummaryPeriod,
} from "./components/priceListTypes";

export default function CreatePriceList() {
  const [form, setForm] = useState<PriceForm>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | PriceCategory>("all");
  const [activeOnly, setActiveOnly] = useState(false);
  const [monthlyDate, setMonthlyDate] = useState(() => new Date().toISOString().slice(0, 7));
  const [yearlyDate, setYearlyDate] = useState(() => String(new Date().getFullYear()));
  const [cloneOpen, setCloneOpen] = useState(false);
  const [cloneFromMonth, setCloneFromMonth] = useState("");
  const [cloneToMonth, setCloneToMonth] = useState("");
  const [cloneOverwrite, setCloneOverwrite] = useState(false);
  const [cloneResetSold, setCloneResetSold] = useState(true);
  const [cloneResetStock, setCloneResetStock] = useState(false);

  const { data: allItems = [] } = usePriceItemsQuery({
    q: undefined,
    category: "all",
    activeOnly: false,
  });

  const { data: items = [], isLoading } = usePriceItemsQuery({
    q: searchTerm,
    category: categoryFilter,
    activeOnly,
  });

  const { isLoading: isSummariesLoading } = usePriceSummariesQuery({
    monthlyDate,
    yearlyDate,
  });

  const resolvedSummaries = useMemo((): Record<SummaryPeriod, PriceSummary> => {
    const localMonthly = calculatePriceSummary(allItems, "monthly", monthlyDate);
    const localYearly = calculatePriceSummary(allItems, "yearly", yearlyDate);
    return {
      monthly: localMonthly,
      yearly: localYearly,
    };
  }, [allItems, monthlyDate, yearlyDate]);

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    allItems.forEach((item) => {
      const cat = String(item.category || "").trim();
      if (cat) cats.add(cat);
    });
    predefinedCategories.forEach((p) => cats.add(p));
    return Array.from(cats).sort((a, b) => a.localeCompare(b));
  }, [allItems]);

  const createMutation = useCreatePriceItemMutation();
  const updateMutation = useUpdatePriceItemMutation();
  const deleteMutation = useDeletePriceItemMutation();
  const cloneMonthMutation = useClonePriceListMonthMutation();

  const prevMonthOf = (month: string) => {
    const [yRaw, mRaw] = String(month || "").split("-");
    const y = Number(yRaw);
    const m = Number(mRaw);
    if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) return "";
    const d = new Date(y, m - 2, 1, 0, 0, 0, 0);
    return d.toISOString().slice(0, 7);
  };

  useEffect(() => {
    setCloneToMonth(monthlyDate);
    setCloneFromMonth(prevMonthOf(monthlyDate));
  }, [monthlyDate]);

  const updateForm = (updates: Partial<PriceForm>) => {
    setForm((current) => ({ ...current, ...updates }));
  };

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    const name = form.name.trim();
    const price = Number(form.price);

    if (!name) {
      toast.error("Enter an item name");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      toast.error("Enter a valid price amount");
      return;
    }

    const payload = {
      name,
      category: form.category,
      description: form.description.trim(),
      unit: form.unit.trim() || "per item",
      price,
      isActive: form.isActive,
      stockQuantity: Number(form.stockQuantity) || 0,
      soldQuantity: Number(form.soldQuantity) || 0,
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload });
        toast.success("Price item updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Price item added");
      }
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save price item");
    }
  };

  const handleEdit = (item: PriceItem) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      category: item.category,
      description: item.description,
      unit: item.unit,
      price: String(item.price),
      isActive: item.isActive,
      stockQuantity: String(item.stockQuantity ?? ""),
      soldQuantity: String(item.soldQuantity ?? ""),
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      if (editingId === id) resetForm();
      toast.success("Price item removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove item");
    }
  };

  const handleDuplicate = async (item: PriceItem) => {
    try {
      await createMutation.mutateAsync({
        ...item,
        name: `${item.name} Copy`,
      });
      toast.success("Price item duplicated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to duplicate item");
    }
  };

  const toggleStatus = async (id: string) => {
    const item = items.find((i) => i._id === id);
    if (!item) return;

    try {
      await updateMutation.mutateAsync({
        id,
        payload: { isActive: !item.isActive },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to toggle status");
    }
  };

  const loadStarterTemplate = (template: PriceTemplate) => {
    setForm({
      name: template.name,
      category: template.category,
      description: template.description,
      unit: template.unit,
      price: String(template.price),
      isActive: template.isActive,
      stockQuantity: template.stockQuantity !== undefined ? String(template.stockQuantity) : "",
      soldQuantity: template.soldQuantity !== undefined ? String(template.soldQuantity) : "",
    });
    setEditingId(null);
  };

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Price List Management</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage itemized hospital pricing for drugs, consultation fees, bed fees, procedures,
            and other billable services.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{isLoading ? "Syncing..." : ""}</Badge>
          <Button
            variant="outline"
            onClick={() => {
              setCloneToMonth(monthlyDate);
              setCloneFromMonth(prevMonthOf(monthlyDate));
              setCloneOverwrite(false);
              setCloneResetSold(true);
              setCloneResetStock(false);
              setCloneOpen(true);
            }}
          >
            Copy Previous Month
          </Button>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <PriceListSummaryCards
          summaries={resolvedSummaries}
          isLoading={isSummariesLoading}
          monthlyDate={monthlyDate}
          yearlyDate={yearlyDate}
          onMonthlyDateChange={setMonthlyDate}
          onYearlyDateChange={setYearlyDate}
        />
      </Suspense>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Suspense
          fallback={
            <Card className="xl:col-span-1">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-5 w-1/2" />
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          }
        >
          <PriceListFormCard
            form={form}
            editingId={editingId}
            availableCategories={availableCategories}
            onFormChange={updateForm}
            onSubmit={handleSubmit}
            onReset={resetForm}
          />
        </Suspense>

        <Card className="xl:col-span-2">
          <CardContent className="space-y-4">
            <section className="flex flex-col lg:flex-row justify-between gap-4">
              <Suspense
                fallback={
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:min-w-[40rem]">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                }
              >
                <PriceListTemplates
                  templates={quickAddTemplates}
                  onTemplateSelect={loadStarterTemplate}
                />
              </Suspense>

              <Suspense
                fallback={
                  <div className="w-full">
                    {Array.from({ length: 1 }).map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                }
              >
                <TopSellingDrugsCard />
              </Suspense>
            </section>
            <Suspense fallback={<Skeleton className="h-10 w-full" />}>
              <PriceListFilters
                searchTerm={searchTerm}
                categoryFilter={categoryFilter}
                activeOnly={activeOnly}
                availableCategories={availableCategories}
                onSearchChange={setSearchTerm}
                onCategoryFilterChange={setCategoryFilter}
                onActiveOnlyChange={setActiveOnly}
              />
            </Suspense>
            <Suspense
              fallback={
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              }
            >
              <PriceListTable
                items={items}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onToggleStatus={toggleStatus}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      <Dialog open={cloneOpen} onOpenChange={setCloneOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy Price List Items</DialogTitle>
            <DialogDescription>
              Duplicate all items created in one month into another month.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="from-month">From Month</Label>
              <Input
                id="from-month"
                type="month"
                value={cloneFromMonth}
                onChange={(e) => setCloneFromMonth(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="to-month">To Month</Label>
              <Input
                id="to-month"
                type="month"
                value={cloneToMonth}
                onChange={(e) => setCloneToMonth(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox checked={cloneResetSold} onCheckedChange={(v) => setCloneResetSold(!!v)} />
                <span className="text-sm">Reset sold quantity to 0</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={cloneResetStock} onCheckedChange={(v) => setCloneResetStock(!!v)} />
                <span className="text-sm">Reset stock quantity to 0</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={cloneOverwrite} onCheckedChange={(v) => setCloneOverwrite(!!v)} />
                <span className="text-sm">Overwrite target month items</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCloneOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#56bbe3] text-white hover:bg-[#56bbe3]"
              disabled={cloneMonthMutation.isPending}
              onClick={async () => {
                try {
                  const res = await cloneMonthMutation.mutateAsync({
                    fromMonth: cloneFromMonth,
                    toMonth: cloneToMonth,
                    overwrite: cloneOverwrite,
                    resetSoldQuantity: cloneResetSold,
                    resetStockQuantity: cloneResetStock,
                  });
                  toast.success(`Copied ${res.createdCount} items into ${res.toMonth}`);
                  setMonthlyDate(res.toMonth);
                  setCloneOpen(false);
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Failed to copy month");
                }
              }}
            >
              Copy Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
