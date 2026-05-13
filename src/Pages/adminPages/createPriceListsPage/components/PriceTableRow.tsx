import { Copy, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { getCategoryLabel, formatCurrency, type PriceItem } from "./priceListTypes";

type PriceTableRowProps = {
  item: PriceItem;
  onEdit: (item: PriceItem) => void;
  onDuplicate: (item: PriceItem) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
};

export default function PriceTableRow({
  item,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleStatus,
}: PriceTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>
        <Badge variant="outline">{getCategoryLabel(item.category)}</Badge>
      </TableCell>
      <TableCell>{item.unit}</TableCell>
      <TableCell>{formatCurrency(item.price)}</TableCell>
      {item.category === "drug" ? (
        <>
          <TableCell>{item.stockQuantity ?? 0}</TableCell>
          <TableCell>{item.soldQuantity ?? 0}</TableCell>
          <TableCell className={(item.stockQuantity ?? 0) - (item.soldQuantity ?? 0) <= 0 ? "text-red-600 font-semibold" : ""}>
            {(item.stockQuantity ?? 0) - (item.soldQuantity ?? 0)}
          </TableCell>
        </>
      ) : (
        <>
          <TableCell>-</TableCell>
          <TableCell>-</TableCell>
          <TableCell>-</TableCell>
        </>
      )}
      <TableCell>
        <button type="button" onClick={() => onToggleStatus(item._id)} className="inline-flex">
          <Badge
            className={
              item.isActive
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : "bg-gray-100 text-gray-700 hover:bg-gray-100"
            }
          >
            {item.isActive ? "Active" : "Inactive"}
          </Badge>
        </button>
      </TableCell>
      <TableCell className="max-w-[260px] truncate whitespace-normal text-sm text-muted-foreground">
        {item.description.length > 20
        ? item.description.slice(0, 20) + "..."
        : item.description}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="icon-sm" onClick={() => onEdit(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="icon-sm" onClick={() => onDuplicate(item)}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button type="button" variant="destructive" size="icon-sm" onClick={() => onDelete(item._id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
