"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { SuggestReorderQuantitiesOutput } from '@/ai/flows/suggest-reorder-quantities';
import type { Item } from '@/lib/types';
import { Mail } from 'lucide-react';

interface ReorderSuggestionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  suggestions: SuggestReorderQuantitiesOutput;
  items: Item[];
}

export function ReorderSuggestionDialog({ isOpen, onOpenChange, suggestions, items }: ReorderSuggestionDialogProps) {
  const [editableSuggestions, setEditableSuggestions] = useState<SuggestReorderQuantitiesOutput>([]);

  useEffect(() => {
    if (isOpen) {
      setEditableSuggestions(JSON.parse(JSON.stringify(suggestions)));
    }
  }, [suggestions, isOpen]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const updatedSuggestions = editableSuggestions.map(suggestion =>
      suggestion.itemId === itemId ? { ...suggestion, reorderQuantity: newQuantity } : suggestion
    );
    setEditableSuggestions(updatedSuggestions);
  };

  const getItemDetails = (itemId: string) => {
    return items.find(item => item.id === itemId);
  };

  const handleSendEmail = () => {
    const subject = "Nachbestellung für Fahrzeug";
    const body = editableSuggestions
      .filter(s => s.reorderQuantity > 0)
      .map(suggestion => {
        const item = getItemDetails(suggestion.itemId);
        return `${suggestion.reorderQuantity}x ${item?.name} (Art.-Nr.: ${item?.articleNumber})`;
      })
      .join('\n');
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
  const hasSuggestions = editableSuggestions.some(s => s.reorderQuantity > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nachbestellvorschlag</DialogTitle>
          <DialogDescription>
            Passen Sie die Mengen an und senden Sie die Bestellung per E-Mail ans Büro.
          </DialogDescription>
        </DialogHeader>
        {hasSuggestions ? (
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artikel</TableHead>
                  <TableHead>Art.-Nr.</TableHead>
                  <TableHead className="text-right w-32">Menge</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editableSuggestions.filter(s => s.reorderQuantity > 0).map(suggestion => {
                  const item = getItemDetails(suggestion.itemId);
                  if (!item) return null;
                  return (
                    <TableRow key={suggestion.itemId}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.articleNumber}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={suggestion.reorderQuantity}
                          onChange={(e) => handleQuantityChange(suggestion.itemId, parseInt(e.target.value, 10) || 0)}
                          className="w-24 h-8 text-right font-mono"
                          min="0"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            <p className='font-semibold'>Aktuell sind keine Nachbestellungen notwendig.</p>
            <p className="text-sm mt-1">Alle Artikel sind ausreichend auf Lager.</p>
          </div>
        )}
        <DialogFooter className="mt-4 sm:justify-between gap-2">
           <Button variant="outline" onClick={() => onOpenChange(false)}>Schließen</Button>
          {hasSuggestions && (
            <Button onClick={handleSendEmail}>
              <Mail className="mr-2" />
              Bestellung per E-Mail senden
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
