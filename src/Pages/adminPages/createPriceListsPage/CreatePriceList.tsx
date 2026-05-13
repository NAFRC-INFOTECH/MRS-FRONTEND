import { Suspense, lazy, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePriceItemsQuery, usePriceSummariesQuery } from "@/api-integration/queries/priceList";
import {
  useCreatePriceItemMutation,
  useDeletePriceItemMutation,
  useUpdatePriceItemMutation,
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

import {
  defaultForm,
  quickAddTemplates,
  calculatePriceSummary,
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
    allItems.forEach((item) => cats.add(item.category));
    const predefined = ["drug", "consultation", "bed", "procedure", "laboratory", "other"];
    predefined.forEach((p) => cats.add(p));
    return Array.from(cats).sort();
  }, [allItems]);

  const createMutation = useCreatePriceItemMutation();
  const updateMutation = useUpdatePriceItemMutation();
  const deleteMutation = useDeletePriceItemMutation();

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
            <Suspense
              fallback={
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
    </div>
  );
}
