'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { categories } from '@/lib/data';
import { List } from 'lucide-react';
import React from 'react';

export function CategoryManager() {
  const [newCategory, setNewCategory] = React.useState('');

  const handleAddCategory = () => {
    if (newCategory.trim() !== '') {
      console.log('Adding category:', newCategory);
      // Here you would typically call an action to add the category
      setNewCategory('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Categories</CardTitle>
        <CardDescription>
          Add or edit your transaction categories.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-md border p-4"
              >
                <div className="flex items-center gap-3">
                  <category.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{category.name}</span>
                </div>
                {/* Add Edit/Delete buttons here if needed */}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <div className="flex w-full items-center gap-2">
          <Input
            type="text"
            placeholder="New category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAddCategory}>Add Category</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
