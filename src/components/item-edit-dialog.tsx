"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Item } from '@/lib/types';

interface ItemEditDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (item: Omit<Item, 'id' | 'currentStock' | 'type'>, existingItemId?: string) => void;
  onDelete?: (itemId: string) => void;
  item: Item | null;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name muss mindestens 2 Zeichen lang sein." }),
  articleNumber: z.string().min(1, { message: "Artikelnummer ist erforderlich." }),
  listPrice: z.coerce.number().positive({ message: "Preis muss positiv sein." }),
  targetStock: z.coerce.number().int().nonnegative({ message: "Soll-Bestand darf nicht negativ sein." }),
  incrementStep: z.coerce.number().int().positive({ message: "Schrittweite muss positiv sein." }),
});

export function ItemEditDialog({ isOpen, onOpenChange, onSave, onDelete, item }: ItemEditDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      articleNumber: '',
      listPrice: 0,
      targetStock: 0,
      incrementStep: 1,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (item) {
        form.reset({
          name: item.name,
          articleNumber: item.articleNumber,
          listPrice: item.listPrice,
          targetStock: item.targetStock,
          incrementStep: item.incrementStep,
        });
      } else {
        form.reset({
          name: '',
          articleNumber: '',
          listPrice: 0,
          targetStock: 10,
          incrementStep: 1,
        });
      }
    }
  }, [item, form, isOpen]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(values, item?.id);
  }
  
  const handleDelete = () => {
    if (item && onDelete) {
      onDelete(item.id);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{item ? 'Artikel bearbeiten' : 'Neuen Artikel anlegen'}</DialogTitle>
          <DialogDescription>
            {item ? 'Ändern Sie die Details des Artikels.' : 'Fügen Sie einen neuen Artikel zu Ihrem Bestand hinzu.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Rollenbock SPU" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="articleNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artikelnummer</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. 63637" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="listPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preis (€)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soll</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="incrementStep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schritt</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4 sm:justify-between">
              {item && onDelete ? (
                 <Button type="button" variant="destructive" onClick={handleDelete}>Löschen</Button>
              ) : <div></div>}
              <div className='flex gap-2'>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                <Button type="submit">Speichern</Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
