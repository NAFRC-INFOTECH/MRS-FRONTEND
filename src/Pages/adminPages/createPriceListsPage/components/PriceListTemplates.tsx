import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type PriceTemplate } from "./priceListTypes";
import TemplateCard from "./TemplateCard";

type PriceListTemplatesProps = {
  templates: PriceTemplate[];
  onTemplateSelect: (template: PriceTemplate) => void;
};

export function PriceListTemplates({
  templates,
  onTemplateSelect,
}: PriceListTemplatesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Price Templates</CardTitle>
        <CardDescription>
          Load common billing items to speed up price list creation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard key={template.name} template={template} onSelect={onTemplateSelect} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
