import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type PriceItem } from "./priceListTypes";
import PriceTableRow from "./PriceTableRow";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
  const [pageSize, setPageSize] = useState<number>(5);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    setPage(1);
  }, [items, pageSize]);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(total, startIndex + pageSize);

  const paginatedItems = useMemo(() => items.slice(startIndex, endIndex), [items, startIndex, endIndex]);

  return (
    <div className="space-y-3">
      <Table className="">
        <TableHeader>
          <TableRow className="bg-[#56bbe3] hover:bg-[#56bbe3] text-white">
            <TableHead className="text-white">Item</TableHead>
            <TableHead className="text-white">Category</TableHead>
            <TableHead className="text-white">Unit</TableHead>
            <TableHead className="text-white">Price</TableHead>
            <TableHead className="text-white">Stock</TableHead>
            <TableHead className="text-white">Sold</TableHead>
            <TableHead className="text-white">Remaining</TableHead>
            <TableHead className="text-white">Status</TableHead>
            <TableHead className="text-white">Description</TableHead>
            <TableHead className="text-right text-white">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedItems.map((item) => (
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
              <TableCell colSpan={10} className="py-8 text-center text-sm text-muted-foreground">
                No price items match the current filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {items.length > 0 && (
        <div className="flex flex-col gap-4 mt-4 bg-background/80 backdrop-blur md:flex-row md:items-center md:justify-between">
          {/* Left */}
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-foreground">
              Showing{" "}
              <span className="font-semibold">
                {startIndex + 1}-{endIndex}
              </span>{" "}
              of <span className="font-semibold">{total}</span> entries
            </p>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Rows per page
              </span>

              <Select
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger className="h-9 w-[85px] rounded-xl border-muted bg-muted/40 text-sm shadow-none">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent className="rounded-xl">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="1000">1000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center justify-between gap-4 md:justify-end">
            {/* Page indicator */}
            <div className="rounded-xl border bg-muted/40 px-4 py-2 text-sm font-medium">
              Page {safePage} of {totalPages}
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl"
                disabled={safePage <= 1}
                onClick={() =>
                  setPage((p) => Math.max(1, p - 1))
                }
              >
                <ArrowLeft/>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl"
                disabled={safePage >= totalPages}
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
              >
                <ArrowRight/>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
