export type PriceCategory = string;

export const predefinedCategories = [
  "drug",
  "consultation",
  "bed",
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
};

export type PriceForm = {
  name: string;
  category: PriceCategory;
  description: string;
  unit: string;
  price: string;
  isActive: boolean;
};

export type PriceSummary = {
  totalItems: number;
  activeItems: number;
  drugs: number;
  services: number;
  totalValue: number;
};

export type PriceTemplate = Omit<PriceItem, "_id">;

export const STORAGE_KEY = "mrs-admin-price-list";

export const categoryLabels: Record<string, string> = {
  drug: "Drugs",
  consultation: "Consultation",
  bed: "Bed Fees",
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
};

export const quickAddTemplates: PriceTemplate[] = [
  {
    name: "Specialist Consultation Fee",
    category: "consultation",
    description: "Consultation charge for specialist review.",
    unit: "per visit",
    price: 10000,
    isActive: true,
  },
  {
    name: "Private Room Bed Fee",
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
