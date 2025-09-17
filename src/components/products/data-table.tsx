
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { EditProductSheet } from './edit-product-sheet';
import { useToast } from '@/hooks/use-toast';

export function ProductsDataTable({ data }: { data: Product[] }) {
  const { deleteProduct } = useAppStore();
  const { toast } = useToast();

  const handleDelete = (product: Product) => {
    deleteProduct(product.id);
    toast({
      title: 'Product Deleted',
      description: `${product.name} has been removed.`,
      variant: 'destructive',
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Cost Price</TableHead>
          <TableHead className="text-right">Selling Price</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((product) => {
          return (
            <TableRow key={product.id}>
              <TableCell>
                <div className="font-medium">{product.name}</div>
              </TableCell>
              <TableCell>
                {product.description}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(product.costPrice)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(product.price)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <EditProductSheet product={product} />
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(product)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Product
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
