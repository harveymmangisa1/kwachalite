
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/data';
import { AddProductSheet } from '@/components/products/add-product-sheet';
import { ProductsDataTable } from '@/components/products/data-table';

export default function ProductsPage() {
    const { products } = useAppStore();
    return (
        <div className="flex-1 space-y-4">
            <PageHeader title="Products & Services" description="Manage your products and services.">
                <AddProductSheet />
            </PageHeader>
            <div className="px-4 sm:px-6">
                <Card>
                    <CardHeader>
                        <CardTitle>All Products</CardTitle>
                        <CardDescription>
                            Here is a list of all your products and services.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProductsDataTable data={products} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
