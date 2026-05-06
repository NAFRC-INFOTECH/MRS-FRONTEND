import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type PriceItem } from "./priceListTypes";
import PriceTableRow from "./PriceTableRow";

type PriceListTableProps = {
  items: PriceItem[];
  onEdit: (item: PriceItem) => void;
  onDuplicate: (item: PriceItem) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
};

export function PriceListTable({
  items,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleStatus,
}: PriceListTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-[#56bbe3] hover:bg-[#56bbe3] text-white">
          <TableHead className="text-white">Item</TableHead>
          <TableHead className="text-white">Category</TableHead>
          <TableHead className="text-white">Unit</TableHead>
          <TableHead className="text-white">Price</TableHead>
          <TableHead className="text-white">Status</TableHead>
          <TableHead className="text-white">Description</TableHead>
          <TableHead className="text-right text-white">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <PriceTableRow
            key={item._id}
            item={item}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        ))}

        {items.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
              No price items match the current filters.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
