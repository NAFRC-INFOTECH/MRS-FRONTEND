import { categoryLabels, formatCurrency, type PriceTemplate } from "./priceListTypes";

type TemplateCardProps = {
  template: PriceTemplate;
  onSelect: (template: PriceTemplate) => void;
};

export default function TemplateCard({ template, onSelect }: TemplateCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      className="rounded-md border px-4 py-2 text-left transition hover:border-primary hover:bg-accent/40"
    >
      <p className="font-medium">{template.name}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {categoryLabels[template.category]}
      </p>
      <p className="mt-2 text-sm font-semibold">{formatCurrency(template.price)}</p>
    </button>
  );
}
