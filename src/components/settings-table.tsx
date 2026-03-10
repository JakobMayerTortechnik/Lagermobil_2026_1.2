"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Item, ItemType } from '@/lib/types';
import { initialItems, initialSpareParts, initialTools } from '@/lib/mock-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { ItemEditDialog } from './item-edit-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface SettingsTableProps {
  itemType: ItemType;
}

const itemTypeConfig = {
    assembly: {
        storageKey: 'items',
        initialData: initialItems,
    },
    spareParts: {
        storageKey: 'spare_parts_items',
        initialData: initialSpareParts,
    },
    tools: {
        storageKey: 'tool_items',
        initialData: initialTools,
    }
}

export function SettingsTable({ itemType }: SettingsTableProps) {
  const { storageKey, initialData } = itemTypeConfig[itemType];
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const savedItems = localStorage.getItem(storageKey);
    setItems(savedItems ? JSON.parse(savedItems) : initialData);
  }, [storageKey, initialData]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [items, isClient, storageKey]);

  const { toast } = useToast();

  const handleAddNew = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDeleteRequest = (itemId: string) => {
    setItemToDelete(itemId);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      setItems(items.filter(item => item.id !== itemToDelete));
      toast({
        title: 'Artikel gelöscht',
        description: 'Der Artikel wurde erfolgreich aus der Liste entfernt.',
      });
      setItemToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleSave = (itemData: Omit<Item, 'id' | 'currentStock' | 'type'>, existingItemId?: string) => {
    if (existingItemId) {
      setItems(items.map(item => (item.id === existingItemId ? { ...item, ...itemData } : item)));
      toast({ title: 'Artikel aktualisiert' });
    } else {
      const newItem: Item = {
        ...itemData,
        id: new Date().toISOString(),
        currentStock: 0,
        type: itemType,
      };
      setItems([...items, newItem]);
      toast({ title: 'Artikel hinzugefügt' });
    }
    setDialogOpen(false);
  };
  
  const handleDeleteFromDialog = (itemId: string) => {
    setDialogOpen(false);
    setTimeout(() => {
      handleDeleteRequest(itemId);
    }, 150);
  }

  const filteredItems = useMemo(() => {
    if (!isClient) return [];
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.articleNumber.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => a.name.localeCompare(b.name));
  }, [items, searchTerm, isClient]);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);
  };

  if (!isClient) {
     return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="h-10 bg-muted rounded-md w-1/3 animate-pulse"></div>
                <div className="h-10 bg-muted rounded-md w-1/4 animate-pulse"></div>
            </div>
            <div className="border rounded-lg p-4 space-y-2">
                <div className="h-8 bg-muted rounded-md w-full animate-pulse"></div>
                <div className="h-8 bg-muted rounded-md w-full animate-pulse"></div>
                <div className="h-8 bg-muted rounded-md w-full animate-pulse"></div>
            </div>
        </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Artikel suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2" />
          Neuer Artikel
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Artikel</TableHead>
              <TableHead>Art.-Nr.</TableHead>
              <TableHead className="hidden md:table-cell text-right">Preis</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Soll</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Schritt</TableHead>
              <TableHead className="w-[100px] text-right">Aktion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.articleNumber}</TableCell>
                <TableCell className="hidden md:table-cell text-right font-mono">{formatPrice(item.listPrice)}</TableCell>
                <TableCell className="text-right font-mono hidden sm:table-cell">{item.targetStock}</TableCell>
                <TableCell className="text-right font-mono hidden sm:table-cell">{item.incrementStep}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Bearbeiten</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteRequest(item.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Löschen</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ItemEditDialog 
        isOpen={isDialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        onDelete={handleDeleteFromDialog}
        item={editingItem}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Der Artikel wird dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
