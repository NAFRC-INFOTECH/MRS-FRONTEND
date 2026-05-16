export type PriceCategory = string;

export const predefinedCategories = [
  "drug",
  "consultation",
  "bed",
  "registration",
  "procedure",
  "laboratory",
  "other",
] as const;

export type PredefinedCategory = (typeof predefinedCategories)[number];

export type PriceItem = {
  _id: string;
  name: string;
  category: PriceCategory;
  description: string;
  unit: string;
  price: number;
  isActive: boolean;
  stockQuantity?: number;
  soldQuantity?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type PriceForm = {
  name: string;
  category: PriceCategory;
  description: string;
  unit: string;
  price: string;
  isActive: boolean;
  stockQuantity?: string;
  soldQuantity?: string;
};

export type SummaryPeriod = "monthly" | "yearly";

export type PriceSummary = {
  period?: SummaryPeriod;
  from?: string;
  to?: string;
  totalItems: number;
  activeItems: number;
  drugs: number;
  services: number;
  servicesValue: number;
  totalValue: number;
  totalDrugs: number;
  totalDrugsInStock: number;
  totalDrugsSold: number;
  totalDrugsSoldValue: number;
};

export type PriceTemplate = Omit<PriceItem, "_id">;

export const STORAGE_KEY = "mrs-admin-price-list";

export const categoryLabels: Record<string, string> = {
  drug: "Drugs",
  consultation: "Consultation",
  bed: "Bed Fees",
  registration: "Registration Fee",
  procedure: "Procedures",
  laboratory: "Laboratory",
  other: "Other",
};

export const getCategoryLabel = (cat: string) => {
  if (categoryLabels[cat]) return categoryLabels[cat];
  return cat.charAt(0).toUpperCase() + cat.slice(1);
};

export const defaultForm: PriceForm = {
  name: "",
  category: "drug",
  description: "",
  unit: "per item",
  price: "",
  isActive: true,
  stockQuantity: "",
  soldQuantity: "",
};

export const quickAddTemplates: PriceTemplate[] = [
  {
    name: "Registration",
    category: "registration",
    description: "Initial patient registration and file creation fee.",
    unit: "per patient",
    price: 5000,
    isActive: true,
  },
  {
    name: "Specialist Consultation",
    category: "consultation",
    description: "Consultation charge for specialist review.",
    unit: "per visit",
    price: 10000,
    isActive: true,
  },
  {
    name: "Private Room Bed",
    category: "bed",
    description: "Admission fee for private room occupancy.",
    unit: "per day",
    price: 30000,
    isActive: true,
  },
  {
    name: "IV Infusion Procedure",
    category: "procedure",
    description: "Administration and monitoring of IV infusion.",
    unit: "per procedure",
    price: 7500,
    isActive: true,
  },
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(value);

export const calculatePriceSummary = (
  items: PriceItem[], 
  period: SummaryPeriod, 
  referenceDate: string
): PriceSummary => {
  const filteredItems = items.filter((item) => {
    if (!item.createdAt) return true;
    const itemDate = new Date(item.createdAt);
    if (period === "monthly") {
      const [year, month] = referenceDate.split("-");
      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.getMonth() + 1;
      return itemYear === Number(year) && itemMonth === Number(month);
    } else {
      const itemYear = itemDate.getFullYear();
      return itemYear === Number(referenceDate);
    }
  });

  const totalItems = filteredItems.length;
  const activeItemsArray = filteredItems.filter((item) => item.isActive);
  const activeItems = activeItemsArray.length;
  const drugItems = filteredItems.filter((item) => item.category === "drug");
  const services = filteredItems.filter((item) => item.category !== "drug").length;

  const totalValue = activeItemsArray.reduce((sum: number, item: PriceItem) => {
    const price = Number(item.price) || 0;
    const multiplier = item.category === "drug" ? (Number(item.stockQuantity) || 0) : 1;
    return sum + price * multiplier;
  }, 0);

  const servicesValue = activeItemsArray.reduce((sum: number, item: PriceItem) => {
    if (item.category === "drug") return sum;
    return sum + (Number(item.price) || 0);
  }, 0);

  const totalDrugsInStock = drugItems.reduce((sum: number, item: PriceItem) => {
    return sum + (Number(item.stockQuantity) || 0);
  }, 0);

  const totalDrugsSold = drugItems.reduce((sum: number, item: PriceItem) => {
    return sum + (Number(item.soldQuantity) || 0);
  }, 0);

  const totalDrugsSoldValue = drugItems.reduce((sum: number, item: PriceItem) => {
    const price = Number(item.price) || 0;
    const sold = Number(item.soldQuantity) || 0;
    return sum + price * sold;
  }, 0);

  return {
    period,
    from: "",
    to: "",
    totalItems,
    activeItems,
    drugs: drugItems.length,
    totalDrugs: drugItems.length,
    services,
    servicesValue,
    totalValue,
    totalDrugsInStock,
    totalDrugsSold,
    totalDrugsSoldValue,
  };
};
